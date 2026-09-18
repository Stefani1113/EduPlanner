package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.entity.InstitutionCarouselImage;
import lombok.Builder;

@Builder
public record CarouselImageResponse(
        Integer idImage,
        String imageUrl,
        Integer imageOrder
) {
    public static CarouselImageResponse fromEntity(InstitutionCarouselImage entity) {
        return CarouselImageResponse.builder()
                .idImage(entity.getIdImage())
                .imageUrl(entity.getImageUrl())
                .imageOrder(entity.getImageOrder())
                .build();
    }
}
