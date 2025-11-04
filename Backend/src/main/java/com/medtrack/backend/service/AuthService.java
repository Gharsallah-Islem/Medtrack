package com.medtrack.backend.service;

import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.UserRepository;
import com.medtrack.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       EmailService emailService, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtils = jwtUtils;
    }

    public User registerUser(String username, String password, String email, String role) {
        System.out.println("Registering user: username=" + username + ", email=" + email + ", role=" + role);
        if (userRepository.findByEmail(email).isPresent() || userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username or email already in use");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(User.Role.valueOf(role));
        user.setVerificationCode(UUID.randomUUID().toString());
        user.setActive(false);

        userRepository.save(user);
        emailService.sendVerificationEmail(email, user.getVerificationCode());
        System.out.println("User saved with verification code: " + user.getVerificationCode());
        return user;
    }

    public boolean verifyUser(String email, String code) {
        System.out.println("Verifying user: email=" + email + ", code=" + code);
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getVerificationCode().equals(code)) {
                user.setActive(true);
                user.setVerificationCode(null);
                userRepository.save(user);
                System.out.println("User activated: " + email);
                return true;
            }
        }
        System.out.println("Verification code mismatch or user not found: " + email);
        return false;
    }

    public String login(String identifier, String password) {
        System.out.println("Login attempt: identifier=" + identifier);
        Optional<User> optionalUser = userRepository.findByUsername(identifier);
        if (!optionalUser.isPresent()) {
            optionalUser = userRepository.findByEmail(identifier);
        }
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            System.out.println("User found: " + user.getUsername());
            if (passwordEncoder.matches(password, user.getPassword()) && user.isActive()) {
                // Updated to include user ID in the token
                String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());
                System.out.println("Token generated: " + token);
                return token;
            } else {
                System.out.println("Password does not match or user is not active");
            }
        } else {
            System.out.println("User not found with identifier: " + identifier);
        }
        throw new RuntimeException("Invalid credentials or user not verified");
    }
}