package com.telcom.equip.service;

import com.telcom.equip.dto.InspectionRequest;
import com.telcom.equip.dto.InspectionResponse;
import com.telcom.equip.dto.MapMarkerResponse;
import com.telcom.equip.entity.*;
import com.telcom.equip.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@Transactional
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionFileRepository inspectionFileRepository;
    private final SurveyRepository surveyRepository;
    private final AssetRepository assetRepository;
    private final FileStorageService fileStorageService;

    public InspectionService(InspectionRepository inspectionRepository,
                             InspectionFileRepository inspectionFileRepository,
                             SurveyRepository surveyRepository,
                             AssetRepository assetRepository,
                             FileStorageService fileStorageService) {
        this.inspectionRepository = inspectionRepository;
        this.inspectionFileRepository = inspectionFileRepository;
        this.surveyRepository = surveyRepository;
        this.assetRepository = assetRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<InspectionResponse> findBySurveyId(Long surveyId) {
        return inspectionRepository.findBySurveySurveyIdOrderByInspectDtDesc(surveyId)
                .stream()
                .map(InspectionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InspectionResponse findById(Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found: " + id));
        return InspectionResponse.from(inspection);
    }

    @Transactional(readOnly = true)
    public InspectionResponse findLatestByAssetId(Long assetId) {
        return inspectionRepository.findLatestByAssetId(assetId)
                .map(InspectionResponse::from)
                .orElse(null);
    }

    public InspectionResponse create(Long surveyId, InspectionRequest request) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found: " + surveyId));
        checkSurveyOpen(survey);

        Asset asset = assetRepository.findById(request.assetId())
                .orElseThrow(() -> new RuntimeException("Asset not found: " + request.assetId()));

        Inspection inspection = new Inspection();
        inspection.setSurvey(survey);
        inspection.setAsset(asset);
        inspection.setInspectDt(request.inspectDt());
        inspection.setInspectorName(request.inspectorName());
        inspection.setResult(request.result());
        inspection.setFieldMemo(request.fieldMemo());
        inspection.setAdminMemo(request.adminMemo());

        return InspectionResponse.from(inspectionRepository.save(inspection));
    }

    public InspectionResponse update(Long id, InspectionRequest request) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found: " + id));
        checkSurveyOpen(inspection.getSurvey());

        if (request.assetId() != null) {
            Asset asset = assetRepository.findById(request.assetId())
                    .orElseThrow(() -> new RuntimeException("Asset not found: " + request.assetId()));
            inspection.setAsset(asset);
        }
        inspection.setInspectDt(request.inspectDt());
        inspection.setInspectorName(request.inspectorName());
        inspection.setResult(request.result());
        inspection.setFieldMemo(request.fieldMemo());
        inspection.setAdminMemo(request.adminMemo());

        return InspectionResponse.from(inspectionRepository.save(inspection));
    }

    public void delete(Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found: " + id));
        checkSurveyOpen(inspection.getSurvey());

        // Delete physical files
        for (InspectionFile file : inspection.getFiles()) {
            fileStorageService.deleteFile(file.getFilePath());
        }

        inspectionRepository.delete(inspection);
    }

    public List<InspectionResponse.FileInfo> uploadFiles(Long inspectionId, MultipartFile[] files) throws IOException {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found: " + inspectionId));
        checkSurveyOpen(inspection.getSurvey());

        List<InspectionResponse.FileInfo> result = new ArrayList<>();
        for (MultipartFile file : files) {
            InspectionFile inspFile = fileStorageService.storeFile(file);
            inspFile.setInspection(inspection);
            inspectionFileRepository.save(inspFile);
            result.add(InspectionResponse.FileInfo.from(inspFile));
        }
        return result;
    }

    public void deleteFile(Long inspectionId, Long fileId) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found: " + inspectionId));
        checkSurveyOpen(inspection.getSurvey());

        InspectionFile file = inspectionFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        fileStorageService.deleteFile(file.getFilePath());
        inspectionFileRepository.delete(file);
    }

    @Transactional(readOnly = true)
    public List<MapMarkerResponse> getMapMarkers(Long surveyId, String result) {
        List<InspectionFile> files;

        if (surveyId != null && result != null) {
            files = inspectionFileRepository.findAllWithGpsBySurveyIdAndResult(surveyId, result);
        } else if (surveyId != null) {
            files = inspectionFileRepository.findAllWithGpsBySurveyId(surveyId);
        } else if (result != null) {
            files = inspectionFileRepository.findAllWithGpsByResult(result);
        } else {
            files = inspectionFileRepository.findAllWithGps();
        }

        // Group by inspection, pick the first file with GPS per inspection
        Map<Long, InspectionFile> byInspection = new LinkedHashMap<>();
        for (InspectionFile f : files) {
            byInspection.putIfAbsent(f.getInspection().getInspectionId(), f);
        }

        return byInspection.values().stream()
                .map(f -> {
                    Inspection insp = f.getInspection();
                    return new MapMarkerResponse(
                            insp.getInspectionId(),
                            insp.getAsset().getAssetNo(),
                            insp.getAsset().getAssetName(),
                            insp.getInspectDt(),
                            insp.getInspectorName(),
                            insp.getResult(),
                            f.getExifLat(),
                            f.getExifLng(),
                            "/api/files/" + f.getFilePath()
                    );
                })
                .toList();
    }

    private void checkSurveyOpen(Survey survey) {
        if ("CLOSED".equals(survey.getStatus())) {
            throw new SurveyClosedException("완료된 실사입니다. 등록·수정·삭제가 불가합니다.");
        }
    }

    public static class SurveyClosedException extends RuntimeException {
        public SurveyClosedException(String message) {
            super(message);
        }
    }
}
