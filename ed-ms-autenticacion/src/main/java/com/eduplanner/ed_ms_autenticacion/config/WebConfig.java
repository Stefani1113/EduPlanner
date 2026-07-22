package com.eduplanner.ed_ms_autenticacion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.eduplanner.ed_ms_autenticacion.security.RoleInterceptor;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Configuration
public class WebConfig implements WebMvcConfigurer{
    private final RoleInterceptor roleInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Registramos el interceptor para que se ejecute en todas las rutas
        registry.addInterceptor(roleInterceptor);
    }
}
