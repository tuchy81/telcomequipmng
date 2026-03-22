package com.telcom.equip.dto;

import com.telcom.equip.entity.Survey;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SurveyResponse(
    Long surveyId,
    String surveyNo,
    String surveyName,
    LocalDate startDate,
    LocalDate endDate,
    String description,
    String status,
    LocalDateTime closedAt,
    String closedBy,
    LocalDateTime createdAt
) {
    public static SurveyResponse from(Survey s) {
        return new SurveyResponse(
            s.getSurveyId(),
            s.getSurveyNo(),
            s.getSurveyName(),
            s.getStartDate(),
            s.getEndDate(),
            s.getDescription(),
            s.getStatus(),
            s.getClosedAt(),
            s.getClosedBy(),
            s.getCreatedAt()
        );
    }
}
