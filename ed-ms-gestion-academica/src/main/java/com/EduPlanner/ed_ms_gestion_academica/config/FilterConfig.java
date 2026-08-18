package com.EduPlanner.ed_ms_gestion_academica.config;
import com.EduPlanner.ed_ms_gestion_academica.filter.JwtValidationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<JwtValidationFilter> jwtFilter(JwtValidationFilter filter) {
        FilterRegistrationBean<JwtValidationFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(filter); bean.addUrlPatterns("/*"); bean.setOrder(0);
        return bean;
    }
}
