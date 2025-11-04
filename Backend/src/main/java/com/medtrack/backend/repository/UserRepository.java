package com.medtrack.backend.repository;

import com.medtrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByRole(User.Role role);
    boolean existsById(Integer id);
    List<User> findByRoleAndUsernameContainingAndSpecialtyContainingAndLocationContaining(
            User.Role role, String username, String specialty, String location);
}