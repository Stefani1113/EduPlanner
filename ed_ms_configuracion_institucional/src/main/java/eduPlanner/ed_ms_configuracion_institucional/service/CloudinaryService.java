package eduPlanner.ed_ms_configuracion_institucional.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import eduPlanner.ed_ms_configuracion_institucional.exception.CloudinaryUploadException;
import eduPlanner.ed_ms_configuracion_institucional.exception.InvalidFileException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder}")
    private String baseFolder;

    @Value("${institution.logo.max-size-bytes}")
    private long maxLogoSizeBytes;

    @Value("${institution.logo.allowed-content-types}")
    private String allowedContentTypesRaw;

    /**
     * RF 10.2.2: valida formato (PNG, JPG o SVG) y tamaño máximo (2 MB)
     * antes de subir el logo institucional.
     */
    public UploadResult uploadLogo(MultipartFile file) {
        validateFile(file);
        return upload(file, baseFolder + "/logo");
    }

    /**
     * Sube una imagen del carrusel institucional. Reutiliza las mismas
     * validaciones de formato/tamaño que el logo.
     */
    public UploadResult uploadCarouselImage(MultipartFile file) {
        validateFile(file);
        return upload(file, baseFolder + "/carousel");
    }

    public void delete(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("No se pudo eliminar la imagen '{}' de Cloudinary: {}", publicId, e.getMessage());
        }
    }

    private UploadResult upload(MultipartFile file, String folder) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "eduplanner/Images-institution",
                            "public_id", UUID.randomUUID().toString(),
                            "resource_type", "auto",
                            "overwrite", true
                    )
            );
            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            return new UploadResult(url, publicId);
        } catch (IOException e) {
            throw new CloudinaryUploadException("No se pudo subir la imagen a Cloudinary", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Debe adjuntar un archivo de imagen");
        }

        if (file.getSize() > maxLogoSizeBytes) {
            throw new InvalidFileException(
                    "El archivo supera el tamaño máximo permitido de 2 MB");
        }

        List<String> allowedTypes = List.of(allowedContentTypesRaw.split(","));
        String contentType = file.getContentType();

        if (contentType == null || allowedTypes.stream().noneMatch(contentType::equalsIgnoreCase)) {
            throw new InvalidFileException(
                    "Formato de archivo inválido. Solo se permite PNG, JPG o SVG");
        }
    }

    public record UploadResult(String url, String publicId) {
    }
}
