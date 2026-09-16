package eduPlanner.ed_ms_configuracion_institucional.repository;

import com.eduplanner.ed_lib_common.entity.InstitutionConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionConfigurationRepository extends JpaRepository<InstitutionConfiguration, Integer> {
}
