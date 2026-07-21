package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class HttpGlobalResponse<T> {
    /**
     * Objeto que contiene una data
     */
    private T data;

    /**
     * Mensaje de respuesta
     */
    private String message;
}
