package com.medtrack.backend.controller;

import com.medtrack.backend.entity.User;
import com.medtrack.backend.service.AuthService;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Setter
    @Getter
    public static class SignupRequest {
        private String username;
        private String password;
        private String email;
        private String role;
    }

    @Setter
    @Getter
    public static class LoginRequest {
        private String identifier;
        private String password;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest signupRequest) {
        System.out.println("Signup request received: username=" + signupRequest.getUsername() +
                ", email=" + signupRequest.getEmail());
        try {
            User user = authService.registerUser(signupRequest.getUsername(), signupRequest.getPassword(),
                    signupRequest.getEmail(), signupRequest.getRole());
            System.out.println("User registered: " + user.getEmail());
            return ResponseEntity.ok("User registered. Check your email for the verification code.");
        } catch (Exception e) {
            System.out.println("Signup failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(
        @RequestParam String email,
        @RequestParam String code
    ) {
        System.out.println("Verification request: email=" + email + ", code=" + code);
        boolean verified = authService.verifyUser(email, code);
        if (verified) {
            System.out.println("User verified: " + email);
            return ResponseEntity.ok(
                Map.of("message", "User verified successfully.")
            );
        } else {
            System.out.println("Verification failed for: " + email);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid verification code."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login request: identifier=" + loginRequest.getIdentifier());
        try {
            String token = authService.login(loginRequest.getIdentifier(), loginRequest.getPassword());
            System.out.println("Login successful, token generated for: " + loginRequest.getIdentifier());
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}