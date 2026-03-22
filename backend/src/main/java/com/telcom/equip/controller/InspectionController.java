package com.telcom.equip.controller;

import com.telcom.equip.dto.InspectionRequest;
import com.telcom.equip.dto.InspectionResponse;
import com.telcom.equip.dto.MapMarkerResponse;
import com.telcom.equip.service.InspectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping("/api/surveys/{surveyId}/inspections")
    public List<InspectionResponse> listBySurvey(@PathVariable Long surveyId) {
        return inspectionService.findBySurveyId(surveyId);
    }

    @GetMapping("/api/inspections/{id}")
    public InspectionResponse detail(@PathVariable Long id) {
        return inspectionService.findById(id);
    }

    @GetMapping("/api/assets/{assetId}/inspections/latest")
    public ResponseEntity<InspectionResponse> latestByAsset(@PathVariable Long assetId) {
        InspectionResponse response = inspectionService.findLatestByAssetId(assetId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/surveys/{surveyId}/inspections")
    public InspectionResponse create(@PathVariable Long surveyId, @RequestBody InspectionRequest request) {
        return inspectionService.create(surveyId, request);
    }

    @PutMapping("/api/inspections/{id}")
    public InspectionResponse update(@PathVariable Long id, @RequestBody InspectionRequest request) {
        return inspectionService.update(id, request);
    }

    @DeleteMapping("/api/inspections/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inspectionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/inspections/{id}/files")
    public List<InspectionResponse.FileInfo> uploadFiles(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        return inspectionService.uploadFiles(id, files);
    }

    @DeleteMapping("/api/inspections/{id}/files/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id, @PathVariable Long fileId) {
        inspectionService.deleteFile(id, fileId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/inspections/map")
    public List<MapMarkerResponse> mapMarkers(
            @RequestParam(name = "survey_id", required = false) Long surveyId,
            @RequestParam(required = false) String result) {
        return inspectionService.getMapMarkers(surveyId, result);
    }
}
