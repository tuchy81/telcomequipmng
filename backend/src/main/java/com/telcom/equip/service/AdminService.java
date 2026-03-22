package com.telcom.equip.service;

import com.telcom.equip.dto.DashboardResponse;
import com.telcom.equip.entity.AdminSetting;
import com.telcom.equip.repository.AdminSettingRepository;
import com.telcom.equip.repository.AssetRepository;
import com.telcom.equip.repository.InspectionRepository;
import com.telcom.equip.repository.SurveyRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@Transactional
public class AdminService {

    private final AdminSettingRepository adminSettingRepository;
    private final SurveyRepository surveyRepository;
    private final AssetRepository assetRepository;
    private final InspectionRepository inspectionRepository;
    private final BCryptPasswordEncoder encoder;

    public AdminService(AdminSettingRepository adminSettingRepository,
                        SurveyRepository surveyRepository,
                        AssetRepository assetRepository,
                        InspectionRepository inspectionRepository,
                        BCryptPasswordEncoder encoder) {
        this.adminSettingRepository = adminSettingRepository;
        this.surveyRepository = surveyRepository;
        this.assetRepository = assetRepository;
        this.inspectionRepository = inspectionRepository;
        this.encoder = encoder;
    }

    public boolean verifyPassword(String password) {
        AdminSetting setting = adminSettingRepository.findBySettingKey("admin_password")
                .orElseThrow(() -> new RuntimeException("Admin password not configured"));
        return encoder.matches(password, setting.getSettingValue());
    }

    public boolean changePassword(String currentPassword, String newPassword) {
        AdminSetting setting = adminSettingRepository.findBySettingKey("admin_password")
                .orElseThrow(() -> new RuntimeException("Admin password not configured"));

        if (!encoder.matches(currentPassword, setting.getSettingValue())) {
            return false;
        }

        setting.setSettingValue(encoder.encode(newPassword));
        adminSettingRepository.save(setting);
        return true;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long activeSurveys = surveyRepository.countByStatus("OPEN");
        long totalAssets = assetRepository.count();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todayInspections = inspectionRepository.countByInspectDtBetween(startOfDay, endOfDay);

        long abnormalCount = inspectionRepository.countByResult("이상");

        return new DashboardResponse(activeSurveys, totalAssets, todayInspections, abnormalCount);
    }
}
