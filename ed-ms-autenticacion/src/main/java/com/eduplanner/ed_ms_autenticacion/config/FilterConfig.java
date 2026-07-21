package com.eduplanner.ed_ms_autenticacion.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.eduplanner.ed_ms_autenticacion.filter.JwtValidationFilter;

@Configuration
public class FilterConfig {
    
    @Bean
    FilterRegistrationBean<JwtValidationFilter> jwtFilter(JwtValidationFilter jwtValidationFilter) {
        // Contenedor de resgistro del bean para el filtro
        FilterRegistrationBean<JwtValidationFilter> registrationBean = new FilterRegistrationBean<>();

        // Filtro con el que quiero que trabaje 
        registrationBean.setFilter(jwtValidationFilter);

        // Alcance del filtro (Todas las peticiones que entren)
        registrationBean.addUrlPatterns("/*");

        // Prioridad de ejecución
        registrationBean.setOrder(0);

        // Retornamos bean para que spring lo inyecte
        return registrationBean;
    }
}
