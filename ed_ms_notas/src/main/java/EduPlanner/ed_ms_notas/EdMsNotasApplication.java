package EduPlanner.ed_ms_notas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class EdMsNotasApplication {

	public static void main(String[] args) {
		SpringApplication.run(EdMsNotasApplication.class, args);
	}

}
