package eduPlanner.ed_ms_configuracion_institucional.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduplanner.ed_lib_common.entity.InstitutionCarouselImage;

import java.util.List;
import java.util.Optional;

public interface InstitutionCarouselImageRepository extends JpaRepository<InstitutionCarouselImage, Integer> {

    List<InstitutionCarouselImage> findByIdConfigurationOrderByImageOrderAsc(Integer idConfiguration);

    long countByIdConfiguration(Integer idConfiguration);

    Optional<InstitutionCarouselImage> findByIdConfigurationAndImageOrder(Integer idConfiguration, Integer imageOrder);

    boolean existsByIdConfigurationAndImageOrder(Integer idConfiguration, Integer imageOrder);
}
