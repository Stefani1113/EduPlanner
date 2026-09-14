package eduPlanner.ed_ms_notas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
@EntityScan(basePackages = {
    "eduPlanner.ed_ms_notas",
    "com.eduplanner.ed_lib_common.entity"
})
public class EdMsNotasApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdMsNotasApplication.class, args);
    }
}
