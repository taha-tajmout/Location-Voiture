package com.mehdiluxury.controller;

import com.mehdiluxury.dto.LoginRequest;
import com.mehdiluxury.dto.PasswordChangeRequest;
import com.mehdiluxury.model.AdminUser;
import com.mehdiluxury.repo.AdminUserRepository;
import com.mehdiluxury.security.AdminAuthFilter;
import com.mehdiluxury.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
public class AuthController {

    private final AdminUserRepository admins;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthController(AdminUserRepository admins, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.admins = admins;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    /** Page d'authentification unique de l'admin. */
    @PostMapping("/api/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<AdminUser> found = admins.findByUsername(
                request.username() == null ? "" : request.username().trim());

        if (found.isEmpty() || !passwordEncoder.matches(request.password(), found.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Identifiant ou mot de passe incorrect"));
        }

        AdminUser admin = found.get();
        return ResponseEntity.ok(Map.of(
                "token", tokenService.createToken(admin.getUsername()),
                "username", admin.getUsername(),
                "displayName", admin.getDisplayName()
        ));
    }

    /** Verifie que le jeton stocke par le navigateur est toujours valide. */
    @GetMapping("/api/admin/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String username = (String) request.getAttribute(AdminAuthFilter.USERNAME_ATTRIBUTE);
        return admins.findByUsername(username)
                .<ResponseEntity<?>>map(admin -> ResponseEntity.ok(Map.of(
                        "username", admin.getUsername(),
                        "displayName", admin.getDisplayName())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/api/admin/password")
    public ResponseEntity<?> changePassword(HttpServletRequest request, @RequestBody PasswordChangeRequest body) {
        String username = (String) request.getAttribute(AdminAuthFilter.USERNAME_ATTRIBUTE);
        AdminUser admin = admins.findByUsername(username).orElse(null);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!passwordEncoder.matches(body.currentPassword(), admin.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mot de passe actuel incorrect"));
        }
        if (body.newPassword() == null || body.newPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Le nouveau mot de passe doit contenir au moins 6 caracteres"));
        }
        admin.setPasswordHash(passwordEncoder.encode(body.newPassword()));
        admins.save(admin);
        return ResponseEntity.ok(Map.of("message", "Mot de passe mis a jour"));
    }
}
