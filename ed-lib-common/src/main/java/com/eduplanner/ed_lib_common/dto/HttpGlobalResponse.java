package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class HttpGlobalResponse<T> {
    private T data;
    private String message;
}
