package eduPlanner.ed_ms_configuracion_institucional.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduplanner.ed_lib_common.entity.InstitutionConfiguration;

public interface InstitutionConfigurationRepository extends JpaRepository<InstitutionConfiguration, Integer> {
}
