// ed-ms-gestion-academica/src/main/java/com/EduPlanner/ed_ms_gestion_academica/security/RoleInterceptor.java
package com.EduPlanner.ed_ms_gestion_academica.security;

import java.util.Arrays;

import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
        if (!(handler instanceof HandlerMethod method)) {
            return true;
        }

        RequireRole annotation = method.getMethodAnnotation(RequireRole.class);
        if (annotation == null) {
            annotation = method.getBeanType().getAnnotation(RequireRole.class);
        }
        if (annotation == null) {
            return true;
        }

        Object roleAttr = request.getAttribute("role");

        if (!(roleAttr instanceof String roleName)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Usuario no autenticado con rol\"}");
            return false;
        }

        boolean hasRole = Arrays.stream(annotation.value())
                .anyMatch(role -> role.name().equals(roleName));

        if (!hasRole) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"No tienes permisos para realizar esta acción\"}");
            return false;
        }

        return true;
    }
}