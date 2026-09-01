package com.mehdiluxury.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** Televersement des photos de vehicules depuis le tableau de bord. */
@RestController
public class UploadController {

    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "webp", "gif", "avif");

    private final Path uploadDir;
    private final String publicBaseUrl;

    public UploadController(@Value("${app.upload-dir}") String uploadDir,
                            @Value("${server.port:8080}") String port) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = "http://localhost:" + port + "/uploads/";
    }

    @PostMapping("/api/admin/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide"));
        }

        String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String extension = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) {
            extension = original.substring(dot + 1).toLowerCase(Locale.ROOT);
        }
        if (!ALLOWED.contains(extension)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Format non supporte. Utilisez jpg, png, webp, gif ou avif."));
        }

        String fileName = UUID.randomUUID() + "." + extension;
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(fileName);
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Echec de l'enregistrement du fichier"));
        }

        return ResponseEntity.ok(Map.of("url", publicBaseUrl + fileName, "fileName", fileName));
    }
}
