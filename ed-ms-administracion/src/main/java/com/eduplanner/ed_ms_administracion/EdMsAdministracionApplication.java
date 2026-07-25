package com.eduplanner.ed_ms_administracion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.eduplanner.ed_lib_common.entity")

public class EdMsAdministracionApplication {

	public static void main(String[] args) {
		SpringApplication.run(EdMsAdministracionApplication.class, args);
	}

}
