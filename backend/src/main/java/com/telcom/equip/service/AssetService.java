package com.telcom.equip.service;

import com.telcom.equip.dto.AssetRequest;
import com.telcom.equip.dto.AssetResponse;
import com.telcom.equip.entity.Asset;
import com.telcom.equip.repository.AssetRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> findAll(String search) {
        List<Asset> assets;
        if (search != null && !search.isBlank()) {
            assets = assetRepository.searchByAssetNoOrName(search.trim());
        } else {
            assets = assetRepository.findAll();
        }
        return assets.stream().map(AssetResponse::from).toList();
    }

    public AssetResponse create(AssetRequest request) {
        Asset asset = new Asset();
        applyRequest(asset, request);
        return AssetResponse.from(assetRepository.save(asset));
    }

    public AssetResponse update(Long id, AssetRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + id));
        applyRequest(asset, request);
        return AssetResponse.from(assetRepository.save(asset));
    }

    public void delete(Long id) {
        assetRepository.deleteById(id);
    }

    private void applyRequest(Asset asset, AssetRequest req) {
        asset.setAssetNo(req.assetNo());
        asset.setAssetName(req.assetName());
        asset.setCategory(req.category());
        asset.setLocationBuilding(req.locationBuilding());
        asset.setLocationFloor(req.locationFloor());
        asset.setLocationRoom(req.locationRoom());
        asset.setRackPosition(req.rackPosition());
        asset.setIpAddress(req.ipAddress());
        asset.setSerialNo(req.serialNo());
        asset.setStatus(req.status());
    }

    @Transactional(readOnly = true)
    public byte[] exportExcel() throws IOException {
        List<Asset> assets = assetRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("자산목록");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Header row
            String[] headers = {"자산번호", "장비명", "분류", "건물", "층", "실/공간",
                    "랙 위치", "관리 IP", "시리얼번호", "운영상태"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            for (int i = 0; i < assets.size(); i++) {
                Asset a = assets.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(a.getAssetNo() != null ? a.getAssetNo() : "");
                row.createCell(1).setCellValue(a.getAssetName() != null ? a.getAssetName() : "");
                row.createCell(2).setCellValue(a.getCategory() != null ? a.getCategory() : "");
                row.createCell(3).setCellValue(a.getLocationBuilding() != null ? a.getLocationBuilding() : "");
                row.createCell(4).setCellValue(a.getLocationFloor() != null ? a.getLocationFloor() : "");
                row.createCell(5).setCellValue(a.getLocationRoom() != null ? a.getLocationRoom() : "");
                row.createCell(6).setCellValue(a.getRackPosition() != null ? a.getRackPosition() : "");
                row.createCell(7).setCellValue(a.getIpAddress() != null ? a.getIpAddress() : "");
                row.createCell(8).setCellValue(a.getSerialNo() != null ? a.getSerialNo() : "");
                row.createCell(9).setCellValue(a.getStatus() != null ? a.getStatus() : "");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
