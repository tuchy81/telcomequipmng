package com.telcom.equip.dto;

import com.telcom.equip.entity.Asset;

import java.time.LocalDateTime;

public record AssetResponse(
    Long assetId,
    String assetNo,
    String assetName,
    String category,
    String locationBuilding,
    String locationFloor,
    String locationRoom,
    String rackPosition,
    String ipAddress,
    String serialNo,
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static AssetResponse from(Asset a) {
        return new AssetResponse(
            a.getAssetId(),
            a.getAssetNo(),
            a.getAssetName(),
            a.getCategory(),
            a.getLocationBuilding(),
            a.getLocationFloor(),
            a.getLocationRoom(),
            a.getRackPosition(),
            a.getIpAddress(),
            a.getSerialNo(),
            a.getStatus(),
            a.getCreatedAt(),
            a.getUpdatedAt()
        );
    }
}
