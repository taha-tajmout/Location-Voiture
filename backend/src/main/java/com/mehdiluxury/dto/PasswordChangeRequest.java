package com.mehdiluxury.dto;

public record PasswordChangeRequest(String currentPassword, String newPassword) {
}
