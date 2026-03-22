package com.telcom.equip.controller;

import com.telcom.equip.dto.SurveyRequest;
import com.telcom.equip.dto.SurveyResponse;
import com.telcom.equip.service.SurveyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "실사(Survey)", description = "실사번호 등록·조회·완료처리·재오픈·삭제")
@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    private final SurveyService surveyService;

    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    @Operation(summary = "실사 목록 조회")
    @GetMapping
    public List<SurveyResponse> list() {
        return surveyService.findAll();
    }

    @Operation(summary = "실사 등록")
    @PostMapping
    public SurveyResponse create(@RequestBody SurveyRequest request) {
        return surveyService.create(request);
    }

    @Operation(summary = "실사 수정")
    @PutMapping("/{id}")
    public SurveyResponse update(@PathVariable Long id, @RequestBody SurveyRequest request) {
        return surveyService.update(id, request);
    }

    @Operation(summary = "실사 완료 처리 (잠금)")
    @PostMapping("/{id}/close")
    public SurveyResponse close(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String closedBy = (body != null) ? body.get("closedBy") : null;
        return surveyService.close(id, closedBy);
    }

    @Operation(summary = "실사 완료 취소 (재오픈)")
    @PostMapping("/{id}/reopen")
    public SurveyResponse reopen(@PathVariable Long id) {
        return surveyService.reopen(id);
    }

    @Operation(summary = "실사 삭제", description = "점검 내역이 없는 경우에만 삭제 가능")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        surveyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
