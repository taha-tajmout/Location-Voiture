package com.mehdiluxury.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Petit service de jetons signes (HMAC-SHA256), sans dependance externe.
 * Format : base64url(payload) + "." + base64url(signature)
 * payload = username|expirationEnMillis
 */
@Service
public class TokenService {

    private final String secret;
    private final long validityMillis;

    public TokenService(@Value("${app.auth.secret}") String secret,
                        @Value("${app.auth.token-validity-hours:12}") long validityHours) {
        this.secret = secret;
        this.validityMillis = validityHours * 3600_000L;
    }

    public String createToken(String username) {
        String payload = username + "|" + (System.currentTimeMillis() + validityMillis);
        return encode(payload.getBytes(StandardCharsets.UTF_8)) + "." + encode(sign(payload));
    }

    /** Retourne le nom d'utilisateur si le jeton est valide, sinon null. */
    public String verify(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return null;
        }
        String payload;
        byte[] providedSignature;
        try {
            payload = new String(decode(parts[0]), StandardCharsets.UTF_8);
            providedSignature = decode(parts[1]);
        } catch (IllegalArgumentException e) {
            return null;
        }
        if (!constantTimeEquals(sign(payload), providedSignature)) {
            return null;
        }
        int separator = payload.lastIndexOf('|');
        if (separator < 0) {
            return null;
        }
        long expiresAt;
        try {
            expiresAt = Long.parseLong(payload.substring(separator + 1));
        } catch (NumberFormatException e) {
            return null;
        }
        if (System.currentTimeMillis() > expiresAt) {
            return null;
        }
        return payload.substring(0, separator);
    }

    private byte[] sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de signer le jeton", e);
        }
    }

    private static boolean constantTimeEquals(byte[] a, byte[] b) {
        if (a.length != b.length) {
            return false;
        }
        int diff = 0;
        for (int i = 0; i < a.length; i++) {
            diff |= a[i] ^ b[i];
        }
        return diff == 0;
    }

    private static String encode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private static byte[] decode(String data) {
        return Base64.getUrlDecoder().decode(data);
    }
}
