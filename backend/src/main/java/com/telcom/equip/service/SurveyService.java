package com.telcom.equip.service;

import com.telcom.equip.dto.SurveyRequest;
import com.telcom.equip.dto.SurveyResponse;
import com.telcom.equip.entity.Survey;
import com.telcom.equip.repository.InspectionRepository;
import com.telcom.equip.repository.SurveyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final InspectionRepository inspectionRepository;

    public SurveyService(SurveyRepository surveyRepository, InspectionRepository inspectionRepository) {
        this.surveyRepository = surveyRepository;
        this.inspectionRepository = inspectionRepository;
    }

    @Transactional(readOnly = true)
    public List<SurveyResponse> findAll() {
        return surveyRepository.findAll().stream()
                .map(SurveyResponse::from)
                .toList();
    }

    public SurveyResponse create(SurveyRequest request) {
        Survey survey = new Survey();
        survey.setSurveyNo(request.surveyNo());
        survey.setSurveyName(request.surveyName());
        survey.setStartDate(request.startDate());
        survey.setEndDate(request.endDate());
        survey.setDescription(request.description());
        return SurveyResponse.from(surveyRepository.save(survey));
    }

    public SurveyResponse update(Long id, SurveyRequest request) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found: " + id));
        survey.setSurveyNo(request.surveyNo());
        survey.setSurveyName(request.surveyName());
        survey.setStartDate(request.startDate());
        survey.setEndDate(request.endDate());
        survey.setDescription(request.description());
        return SurveyResponse.from(surveyRepository.save(survey));
    }

    public SurveyResponse close(Long id, String closedBy) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found: " + id));
        survey.setStatus("CLOSED");
        survey.setClosedAt(LocalDateTime.now());
        survey.setClosedBy(closedBy);
        return SurveyResponse.from(surveyRepository.save(survey));
    }

    public SurveyResponse reopen(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found: " + id));
        survey.setStatus("OPEN");
        survey.setClosedAt(null);
        survey.setClosedBy(null);
        return SurveyResponse.from(surveyRepository.save(survey));
    }

    public void delete(Long id) {
        if (inspectionRepository.existsBySurveySurveyId(id)) {
            throw new IllegalStateException("점검 내역이 있는 실사는 삭제할 수 없습니다.");
        }
        surveyRepository.deleteById(id);
    }
}
