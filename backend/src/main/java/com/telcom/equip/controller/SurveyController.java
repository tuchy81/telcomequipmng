package com.telcom.equip.controller;

import com.telcom.equip.dto.SurveyRequest;
import com.telcom.equip.dto.SurveyResponse;
import com.telcom.equip.service.SurveyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    private final SurveyService surveyService;

    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    @GetMapping
    public List<SurveyResponse> list() {
        return surveyService.findAll();
    }

    @PostMapping
    public SurveyResponse create(@RequestBody SurveyRequest request) {
        return surveyService.create(request);
    }

    @PutMapping("/{id}")
    public SurveyResponse update(@PathVariable Long id, @RequestBody SurveyRequest request) {
        return surveyService.update(id, request);
    }

    @PostMapping("/{id}/close")
    public SurveyResponse close(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String closedBy = (body != null) ? body.get("closedBy") : null;
        return surveyService.close(id, closedBy);
    }

    @PostMapping("/{id}/reopen")
    public SurveyResponse reopen(@PathVariable Long id) {
        return surveyService.reopen(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        surveyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
