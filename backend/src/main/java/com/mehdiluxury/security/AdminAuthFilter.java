package com.mehdiluxury.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Protege les routes /api/admin/**. Le frontend envoie le jeton dans
 * l'entete Authorization: Bearer &lt;token&gt;.
 */
@Component
public class AdminAuthFilter extends OncePerRequestFilter {

    public static final String USERNAME_ATTRIBUTE = "adminUsername";

    private final TokenService tokenService;

    public AdminAuthFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/admin/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Les requetes preliminaires CORS ne portent pas d'entete Authorization.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;
        String username = tokenService.verify(token);

        if (username == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Session expiree ou non autorisee\"}");
            return;
        }

        request.setAttribute(USERNAME_ATTRIBUTE, username);
        chain.doFilter(request, response);
    }
}
