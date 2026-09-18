package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Petición para reordenar las imágenes del carrusel institucional.
 * El administrador envía la lista completa de imágenes con su nueva
 * posición (imageOrder). El servicio valida que no haya posiciones
 * duplicadas y que cada idImage exista antes de persistir el cambio.
 */
public record CarouselReorderRequest(

        @NotEmpty(message = "Debe indicar el nuevo orden de al menos una imagen")
        @Valid
        List<CarouselOrderItem> images
) {
    public record CarouselOrderItem(

            @NotNull(message = "El id de la imagen es obligatorio")
            Integer idImage,

            @NotNull(message = "El orden de la imagen es obligatorio")
            @Min(value = 1, message = "El orden debe ser mayor o igual a 1")
            Integer imageOrder
    ) {
    }
}