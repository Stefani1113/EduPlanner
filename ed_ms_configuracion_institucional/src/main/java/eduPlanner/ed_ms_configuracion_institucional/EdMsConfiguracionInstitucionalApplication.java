package eduPlanner.ed_ms_configuracion_institucional;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

import com.eduplanner.ed_lib_common.entity.InstitutionCarouselImage;
import com.eduplanner.ed_lib_common.entity.InstitutionConfiguration;

@SpringBootApplication
@EntityScan(basePackageClasses = {
        InstitutionConfiguration.class,
        InstitutionCarouselImage.class
})
public class EdMsConfiguracionInstitucionalApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdMsConfiguracionInstitucionalApplication.class, args);
    }	
}