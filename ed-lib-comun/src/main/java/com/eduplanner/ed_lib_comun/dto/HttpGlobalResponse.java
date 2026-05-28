package com.eduplanner.ed_lib_comun.dto;

import lombok.Data;

@Data
public class HttpGlobalResponse<T> {
    private T data;
    private String message;
}
