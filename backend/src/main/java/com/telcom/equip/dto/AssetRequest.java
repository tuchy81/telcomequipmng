package com.telcom.equip.dto;

public record AssetRequest(
    String assetNo,
    String assetName,
    String category,
    String locationBuilding,
    String locationFloor,
    String locationRoom,
    String rackPosition,
    String ipAddress,
    String serialNo,
    String status
) {}
