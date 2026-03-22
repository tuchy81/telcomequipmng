package com.telcom.equip.controller;

import com.telcom.equip.dto.AdminPasswordRequest;
import com.telcom.equip.dto.DashboardResponse;
import com.telcom.equip.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "관리자(Admin)", description = "관리자 암호 검증·변경, 대시보드")
@RestController
@RequestMapping("/api")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @Operation(summary = "관리자 암호 검증")
    @PostMapping("/admin/verify")
    public ResponseEntity<Map<String, Object>> verifyPassword(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        boolean success = adminService.verifyPassword(password);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @Operation(summary = "관리자 암호 변경", description = "현재 비밀번호 확인 후 새 비밀번호로 변경")
    @PutMapping("/admin/password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody AdminPasswordRequest request) {
        boolean success = adminService.changePassword(request.currentPassword(), request.newPassword());
        if (!success) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "현재 비밀번호가 일치하지 않습니다."));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @Operation(summary = "대시보드 통계", description = "진행중 실사 수, 전체 장비 수, 금일 점검 수, 이상 장비 수")
    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return adminService.getDashboard();
    }
}
