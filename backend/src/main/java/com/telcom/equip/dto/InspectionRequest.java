package com.telcom.equip.dto;

import java.time.LocalDateTime;

public record InspectionRequest(
    Long assetId,
    LocalDateTime inspectDt,
    String inspectorName,
    String result,
    String fieldMemo,
    String adminMemo
) {}
