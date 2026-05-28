package com.eduplanner.ed_ms_autenticacion.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import eduplanner.ed_ms_autenticacion.filter.JwtValidationFilter;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<JwtValidationFilter> jwtFilter(JwtValidationFilter filter) {
        FilterRegistrationBean<JwtValidationFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(filter);
        bean.addUrlPatterns("/*");
        bean.setOrder(0);
        return bean;
    }
}
