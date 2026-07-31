package com.eduplanner.ed_lib_common.dto;


import lombok.Data;

@Data
public class ApiResponseDTO<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponseDTO<T> ok(String message, T data) {
        ApiResponseDTO<T> r = new ApiResponseDTO<>();
        r.setSuccess(true);
        r.setMessage(message);
        r.setData(data);
        return r;
    }

    public static <T> ApiResponseDTO<T> error(String message) {
        ApiResponseDTO<T> r = new ApiResponseDTO<>();
        r.setSuccess(false);
        r.setMessage(message);
        return r;
    }
}
