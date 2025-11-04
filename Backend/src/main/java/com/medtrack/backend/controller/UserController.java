package com.medtrack.backend.controller;

import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.UserRepository;
import com.medtrack.backend.security.JwtUtils;
import com.medtrack.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService, JwtUtils jwtUtils, UserRepository userRepository) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Fetching all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        logger.info("Received request for /api/users/me");
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("No valid authentication found");
            return ResponseEntity.status(403).build();
        }
        String token = (String) authentication.getCredentials();
        logger.debug("JWT Token: {}", token);
        try {
            Integer userId = jwtUtils.getUserIdFromToken(token);
            logger.info("Fetching user profile for user ID: {}", userId);
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error processing JWT token: {}", e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        logger.info("Fetching user with ID: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        logger.info("Creating new user: {}", user.getUsername());
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User user) {
        logger.info("Updating user with ID: {}", id);
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        logger.info("Deleting user with ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/id")
    public ResponseEntity<Integer> getUserId(Authentication authentication) {
        logger.info("Received request for /api/users/me/id");
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("No valid authentication found");
            return ResponseEntity.status(403).build();
        }
        String token = (String) authentication.getCredentials();
        Integer userId = jwtUtils.getUserIdFromToken(token);
        logger.info("Returning user ID: {}", userId);
        return ResponseEntity.ok(userId);
    }

    @PutMapping("/me/profile")
    public ResponseEntity<User> updateCurrentUserProfile(@RequestBody User userUpdates, Authentication authentication) {
        logger.info("Received request for /api/users/me/profile");
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("No valid authentication found");
            return ResponseEntity.status(403).build();
        }
        String token = (String) authentication.getCredentials();
        Integer userId = jwtUtils.getUserIdFromToken(token);
        logger.info("Updating profile for user ID: {}", userId);
        User existingUser = userService.getUserById(userId);
        existingUser.setSpecialty(userUpdates.getSpecialty());
        existingUser.setLocation(userUpdates.getLocation());
        existingUser.setProfileComplete(true);
        User updatedUser = userService.updateUser(userId, existingUser);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<User>> getAllDoctors() {
        logger.info("Fetching all doctors");
        return ResponseEntity.ok(userService.getAllDoctors());
    }

    @GetMapping("/patients")
    public ResponseEntity<List<User>> getAllPatients() {
        logger.info("Fetching all patients");
        List<User> patients = userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.patient)
                .collect(Collectors.toList());
        logger.debug("Returning {} patients", patients.size());
        return ResponseEntity.ok(patients);
    }
}