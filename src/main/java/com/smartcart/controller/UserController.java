package com.smartcart.controller;

import com.smartcart.dto.UpdateProfileRequest;
import com.smartcart.model.User;
import com.smartcart.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private String getLoggedInEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile() {
        return ResponseEntity.ok(userService.getCurrentUser(getLoggedInEmail()));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User updated = userService.updateProfile(
                getLoggedInEmail(),
                request.getName(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(updated);
    }
}