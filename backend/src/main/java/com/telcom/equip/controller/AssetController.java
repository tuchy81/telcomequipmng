package com.telcom.equip.controller;

import com.telcom.equip.dto.AssetRequest;
import com.telcom.equip.dto.AssetResponse;
import com.telcom.equip.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "자산(Asset)", description = "자산 등록·조회·수정·삭제·Excel 다운로드")
@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @Operation(summary = "자산 목록 조회", description = "search 파라미터로 자산번호 또는 장비명 검색")
    @GetMapping
    public List<AssetResponse> list(@RequestParam(required = false) String search) {
        return assetService.findAll(search);
    }

    @Operation(summary = "자산 등록")
    @PostMapping
    public AssetResponse create(@RequestBody AssetRequest request) {
        return assetService.create(request);
    }

    @Operation(summary = "자산 수정")
    @PutMapping("/{id}")
    public AssetResponse update(@PathVariable Long id, @RequestBody AssetRequest request) {
        return assetService.update(id, request);
    }

    @Operation(summary = "자산 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "자산 목록 Excel 다운로드")
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadExcel() throws IOException {
        byte[] excelData = assetService.exportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assets.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }
}
