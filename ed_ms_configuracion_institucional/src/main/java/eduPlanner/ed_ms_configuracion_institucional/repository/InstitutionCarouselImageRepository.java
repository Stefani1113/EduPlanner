package eduPlanner.ed_ms_configuracion_institucional.repository;

import com.eduplanner.ed_lib_common.entity.InstitutionCarouselImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionCarouselImageRepository extends JpaRepository<InstitutionCarouselImage, Integer> {

    List<InstitutionCarouselImage> findByIdConfigurationOrderByImageOrderAsc(Integer idConfiguration);

    Optional<InstitutionCarouselImage> findByIdConfigurationAndImageOrder(Integer idConfiguration, Integer imageOrder);

    long countByIdConfiguration(Integer idConfiguration);

    void deleteByIdConfigurationAndImageOrder(Integer idConfiguration, Integer imageOrder);
}
