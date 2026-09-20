package eduPlanner.ed_ms_configuracion_institucional.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eduplanner.ed_lib_common.dto.CarouselImageResponse;
import com.eduplanner.ed_lib_common.dto.CarouselReorderRequest;
import com.eduplanner.ed_lib_common.entity.InstitutionCarouselImage;
import eduPlanner.ed_ms_configuracion_institucional.exception.BusinessException;
import eduPlanner.ed_ms_configuracion_institucional.exception.ResourceNotFoundException;
import eduPlanner.ed_ms_configuracion_institucional.repository.InstitutionCarouselImageRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * RF 10 (carrusel de imágenes institucionales). Máximo configurable de
 * imágenes (institution.carousel.max-images, por defecto 5, según la
 * restricción CHECK image_order BETWEEN 1 AND 5 de la base de datos).
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class CarouselImageService {

    private static final Integer CONFIGURATION_ID = 1;

    private final InstitutionCarouselImageRepository repository;
    private final Cloudinary cloudinary;

    @Value("${institution.carousel.max-images:5}")
    private int maxImages;

    @Value("${cloudinary.folder:eduplanner/institution}")
    private String cloudinaryFolder;

    public List<CarouselImageResponse> listImages() {
        return repository.findByIdConfigurationOrderByImageOrderAsc(CONFIGURATION_ID).stream()
                .map(CarouselImageResponse::fromEntity)
                .toList();
    }

    @Transactional
    public CarouselImageResponse uploadImage(MultipartFile file, Integer requestedOrder) {
        validateImageFile(file);

        long currentCount = repository.countByIdConfiguration(CONFIGURATION_ID);
        if (currentCount >= maxImages) {
            throw new BusinessException(
                    "El carrusel ya alcanzó el máximo de " + maxImages + " imágenes. Elimina una para agregar otra.");
        }

        int order = resolveOrder(requestedOrder);

        String publicId = "carousel_" + CONFIGURATION_ID + "_" + UUID.randomUUID();
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", cloudinaryFolder,
                    "public_id", publicId,
                    "resource_type", "image"
            ));

            InstitutionCarouselImage entity = InstitutionCarouselImage.builder()
                    .idConfiguration(CONFIGURATION_ID)
                    .imageUrl((String) uploadResult.get("secure_url"))
                    .cloudinaryPublicId((String) uploadResult.get("public_id"))
                    .imageOrder(order)
                    .build();

            return CarouselImageResponse.fromEntity(repository.save(entity));
        } catch (IOException e) {
            log.error("Error subiendo imagen del carrusel a Cloudinary: {}", e.getMessage(), e);
            throw new BusinessException("No se pudo subir la imagen del carrusel. Intenta nuevamente.", e);
        }
    }

    @Transactional
    public void deleteImage(Integer idImage) {
        InstitutionCarouselImage entity = repository.findById(idImage)
                .filter(img -> img.getIdConfiguration().equals(CONFIGURATION_ID))
                .orElseThrow(() -> new ResourceNotFoundException("Imagen de carrusel no encontrada: " + idImage));

        try {
            cloudinary.uploader().destroy(entity.getCloudinaryPublicId(), ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("No se pudo eliminar la imagen en Cloudinary ({}): {}",
                    entity.getCloudinaryPublicId(), e.getMessage());
        }

        repository.delete(entity);
    }

    @Transactional
    public List<CarouselImageResponse> reorder(CarouselReorderRequest request) {
        List<InstitutionCarouselImage> current = repository.findByIdConfigurationOrderByImageOrderAsc(CONFIGURATION_ID);
        Map<Integer, InstitutionCarouselImage> byId = current.stream()
                .collect(java.util.stream.Collectors.toMap(InstitutionCarouselImage::getIdImage, e -> e));

        Set<Integer> seenOrders = new HashSet<>();
        for (var item : request.images()) {
            InstitutionCarouselImage entity = byId.get(item.idImage());
            if (entity == null) {
                throw new ResourceNotFoundException("Imagen de carrusel no encontrada: " + item.idImage());
            }
            if (item.imageOrder() < 1 || item.imageOrder() > maxImages) {
                throw new BusinessException("El orden debe estar entre 1 y " + maxImages);
            }
            if (!seenOrders.add(item.imageOrder())) {
                throw new BusinessException("No puede repetirse la posición " + item.imageOrder() + " en el carrusel");
            }
        }

        // Fase 1: mover a posiciones temporales negativas para no chocar con
        // la restricción única (id_configuration, image_order) mientras se
        // reordena (p. ej. al intercambiar dos imágenes entre sí).
        for (var item : request.images()) {
            InstitutionCarouselImage entity = byId.get(item.idImage());
            entity.setImageOrder(-entity.getIdImage());
        }
        repository.saveAll(byId.values());
        repository.flush();

        // Fase 2: aplicar el orden definitivo.
        for (var item : request.images()) {
            byId.get(item.idImage()).setImageOrder(item.imageOrder());
        }
        repository.saveAll(byId.values());
        repository.flush();

        return listImages();
    }

    private int resolveOrder(Integer requestedOrder) {
        if (requestedOrder == null) {
            for (int candidate = 1; candidate <= maxImages; candidate++) {
                if (!repository.existsByIdConfigurationAndImageOrder(CONFIGURATION_ID, candidate)) {
                    return candidate;
                }
            }
            throw new BusinessException("No hay posiciones disponibles en el carrusel");
        }

        if (requestedOrder < 1 || requestedOrder > maxImages) {
            throw new BusinessException("El orden debe estar entre 1 y " + maxImages);
        }
        if (repository.existsByIdConfigurationAndImageOrder(CONFIGURATION_ID, requestedOrder)) {
            throw new IllegalStateException("Ya existe una imagen en la posición " + requestedOrder);
        }
        return requestedOrder;
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("El archivo de la imagen está vacío");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("El archivo debe ser una imagen (jpg, png, webp)");
        }
    }
}
