package com.telcom.equip.dto;

import java.time.LocalDate;

public record SurveyRequest(
    String surveyNo,
    String surveyName,
    LocalDate startDate,
    LocalDate endDate,
    String description,
    String closedBy
) {}
