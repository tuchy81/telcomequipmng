package com.telcom.equip.dto;

import com.telcom.equip.entity.Inspection;
import com.telcom.equip.entity.InspectionFile;

import java.time.LocalDateTime;
import java.util.List;

public record InspectionResponse(
    Long inspectionId,
    Long surveyId,
    String surveyNo,
    Long assetId,
    String assetNo,
    String assetName,
    LocalDateTime inspectDt,
    String inspectorName,
    String result,
    String fieldMemo,
    String adminMemo,
    String surveyStatus,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<FileInfo> files
) {
    public record FileInfo(
        Long fileId,
        String filePath,
        String fileName,
        Long fileSize,
        Double exifLat,
        Double exifLng,
        LocalDateTime exifTakenAt,
        LocalDateTime createdAt
    ) {
        public static FileInfo from(InspectionFile f) {
            return new FileInfo(
                f.getFileId(),
                f.getFilePath(),
                f.getFileName(),
                f.getFileSize(),
                f.getExifLat(),
                f.getExifLng(),
                f.getExifTakenAt(),
                f.getCreatedAt()
            );
        }
    }

    public static InspectionResponse from(Inspection i) {
        return new InspectionResponse(
            i.getInspectionId(),
            i.getSurvey().getSurveyId(),
            i.getSurvey().getSurveyNo(),
            i.getAsset().getAssetId(),
            i.getAsset().getAssetNo(),
            i.getAsset().getAssetName(),
            i.getInspectDt(),
            i.getInspectorName(),
            i.getResult(),
            i.getFieldMemo(),
            i.getAdminMemo(),
            i.getSurvey().getStatus(),
            i.getCreatedAt(),
            i.getUpdatedAt(),
            i.getFiles().stream().map(FileInfo::from).toList()
        );
    }
}
