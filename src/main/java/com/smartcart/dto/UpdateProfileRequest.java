package com.smartcart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    private String name;

    // Optional — only required if the user wants to change their password
    private String currentPassword;
    private String newPassword;
}