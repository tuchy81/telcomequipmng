package com.telcom.equip.controller;

import com.telcom.equip.dto.InspectionRequest;
import com.telcom.equip.dto.InspectionResponse;
import com.telcom.equip.dto.MapMarkerResponse;
import com.telcom.equip.service.InspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Tag(name = "점검(Inspection)", description = "점검 등록·조회·수정·삭제, 사진 업로드, 지도 마커")
@RestController
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @Operation(summary = "실사별 점검 목록 조회")
    @GetMapping("/api/surveys/{surveyId}/inspections")
    public List<InspectionResponse> listBySurvey(@PathVariable Long surveyId) {
        return inspectionService.findBySurveyId(surveyId);
    }

    @Operation(summary = "점검 상세 조회")
    @GetMapping("/api/inspections/{id}")
    public InspectionResponse detail(@PathVariable Long id) {
        return inspectionService.findById(id);
    }

    @Operation(summary = "자산의 직전 실사 점검 내역 조회")
    @GetMapping("/api/assets/{assetId}/inspections/latest")
    public ResponseEntity<InspectionResponse> latestByAsset(@PathVariable Long assetId) {
        InspectionResponse response = inspectionService.findLatestByAssetId(assetId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "점검 등록", description = "실사 완료(CLOSED) 시 403 반환")
    @PostMapping("/api/surveys/{surveyId}/inspections")
    public InspectionResponse create(@PathVariable Long surveyId, @RequestBody InspectionRequest request) {
        return inspectionService.create(surveyId, request);
    }

    @Operation(summary = "점검 수정", description = "실사 완료(CLOSED) 시 403 반환")
    @PutMapping("/api/inspections/{id}")
    public InspectionResponse update(@PathVariable Long id, @RequestBody InspectionRequest request) {
        return inspectionService.update(id, request);
    }

    @Operation(summary = "점검 삭제", description = "실사 완료(CLOSED) 시 403 반환")
    @DeleteMapping("/api/inspections/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inspectionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "점검 사진 업로드", description = "EXIF GPS 자동 추출. 실사 완료(CLOSED) 시 403 반환")
    @PostMapping("/api/inspections/{id}/files")
    public List<InspectionResponse.FileInfo> uploadFiles(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        return inspectionService.uploadFiles(id, files);
    }

    @Operation(summary = "점검 사진 삭제", description = "실사 완료(CLOSED) 시 403 반환")
    @DeleteMapping("/api/inspections/{id}/files/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id, @PathVariable Long fileId) {
        inspectionService.deleteFile(id, fileId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "지도용 GPS 점검 마커 목록", description = "EXIF GPS 좌표가 있는 사진 기준 마커 반환")
    @GetMapping("/api/inspections/map")
    public List<MapMarkerResponse> mapMarkers(
            @RequestParam(name = "survey_id", required = false) Long surveyId,
            @RequestParam(required = false) String result) {
        return inspectionService.getMapMarkers(surveyId, result);
    }
}
