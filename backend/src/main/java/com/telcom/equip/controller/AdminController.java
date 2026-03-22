package com.telcom.equip.controller;

import com.telcom.equip.dto.AdminPasswordRequest;
import com.telcom.equip.dto.DashboardResponse;
import com.telcom.equip.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/admin/verify")
    public ResponseEntity<Map<String, Object>> verifyPassword(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        boolean success = adminService.verifyPassword(password);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @PutMapping("/admin/password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody AdminPasswordRequest request) {
        boolean success = adminService.changePassword(request.currentPassword(), request.newPassword());
        if (!success) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "현재 비밀번호가 일치하지 않습니다."));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return adminService.getDashboard();
    }
}
