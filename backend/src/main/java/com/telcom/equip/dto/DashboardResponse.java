package com.telcom.equip.dto;

public record DashboardResponse(
    long activeSurveyCount,
    long totalAssetCount,
    long todayInspectionCount,
    long abnormalCount
) {}
