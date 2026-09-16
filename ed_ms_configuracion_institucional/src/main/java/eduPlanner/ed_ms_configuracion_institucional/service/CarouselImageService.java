package eduPlanner.ed_ms_configuracion_institucional.service;

import com.eduplanner.ed_lib_common.dto.CarouselImageResponse;
import com.eduplanner.ed_lib_common.entity.InstitutionCarouselImage;
import eduPlanner.ed_ms_configuracion_institucional.exception.BusinessRuleException;
import eduPlanner.ed_ms_configuracion_institucional.exception.ResourceNotFoundException;
import eduPlanner.ed_ms_configuracion_institucional.repository.InstitutionCarouselImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarouselImageService {

    private static final int SINGLETON_CONFIGURATION_ID = 1;

    private final InstitutionCarouselImageRepository carouselRepository;
    private final CloudinaryService cloudinaryService;

    @Value("${institution.carousel.max-images}")
    private int maxImages;

    @Transactional(readOnly = true)
    public List<CarouselImageResponse> listImages() {
        return carouselRepository
                .findByIdConfigurationOrderByImageOrderAsc(SINGLETON_CONFIGURATION_ID)
                .stream()
                .map(CarouselImageResponse::fromEntity)
                .toList();
    }

    /**
     * Sube una imagen del carrusel en la posición indicada (1..N según
     * institution.carousel.max-images). Si ya existe una imagen en esa
     * posición, se reemplaza (se borra la anterior en Cloudinary).
     */
    @Transactional
    public CarouselImageResponse uploadImage(int imageOrder, MultipartFile file) {
        validateOrder(imageOrder);

        var existing = carouselRepository
                .findByIdConfigurationAndImageOrder(SINGLETON_CONFIGURATION_ID, imageOrder);

        if (existing.isEmpty() &&
                carouselRepository.countByIdConfiguration(SINGLETON_CONFIGURATION_ID) >= maxImages) {
            throw new BusinessRuleException(
                    "Se alcanzó el máximo de " + maxImages + " imágenes en el carrusel");
        }

        CloudinaryService.UploadResult uploadResult = cloudinaryService.uploadCarouselImage(file);

        InstitutionCarouselImage image = existing.orElseGet(() -> InstitutionCarouselImage.builder()
                .idConfiguration(SINGLETON_CONFIGURATION_ID)
                .imageOrder(imageOrder)
                .build());

        String previousPublicId = image.getCloudinaryPublicId();

        image.setImageUrl(uploadResult.url());
        image.setCloudinaryPublicId(uploadResult.publicId());

        InstitutionCarouselImage saved = carouselRepository.save(image);

        if (previousPublicId != null && !previousPublicId.isBlank()) {
            cloudinaryService.delete(previousPublicId);
        }

        return CarouselImageResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteImage(Integer idImage) {
        InstitutionCarouselImage image = carouselRepository.findById(idImage)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró la imagen de carrusel con id " + idImage));

        carouselRepository.delete(image);
        cloudinaryService.delete(image.getCloudinaryPublicId());
    }

    private void validateOrder(int imageOrder) {
        if (imageOrder < 1 || imageOrder > maxImages) {
            throw new BusinessRuleException(
                    "El orden de la imagen debe estar entre 1 y " + maxImages);
        }
    }
}
