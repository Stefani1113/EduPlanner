package com.EduPlanner.ed_ms_gestion_academica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.eduplanner.ed_lib_common.entity")
public class EdMsGestionAcademicaApplication {
    public static void main(String[] args) {
        SpringApplication.run(EdMsGestionAcademicaApplication.class, args);
    }
}
