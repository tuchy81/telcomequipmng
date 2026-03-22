package com.telcom.equip.dto;

import java.time.LocalDateTime;

public record MapMarkerResponse(
    Long inspectionId,
    String assetNo,
    String assetName,
    LocalDateTime inspectDt,
    String inspectorName,
    String result,
    Double exifLat,
    Double exifLng,
    String thumbnailUrl
) {}
