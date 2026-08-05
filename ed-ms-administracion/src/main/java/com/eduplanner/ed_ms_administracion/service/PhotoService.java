package com.eduplanner.ed_ms_administracion.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PhotoService {
    
    private final Cloudinary cloudinary;
    private final UserRepository userRepository;

    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024;

    @Transactional
    public String uploadProfilePhoto(Integer idUser, MultipartFile file) throws IOException {
        validateFile(file);

        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new IllegalArgumentException("usuario no encontrado"));

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
            "folder", "eduplanner/profile-photos",
            "public_id", "user_" + idUser,
            "overwrite", true,
            "resource_type", "image"
        ));

        String secureUrl = (String) uploadResult.get("secure_url");
        user.setPhotoUrl(secureUrl);
        userRepository.save(user);

        return secureUrl;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen (jpg, png, img)");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("La imagen no debe superar los 5MB");
        }
    }
}

