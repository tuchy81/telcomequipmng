package com.telcom.equip.dto;

public record AdminPasswordRequest(
    String currentPassword,
    String newPassword
) {}
