package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;

@Builder
public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        List<String> details
) {
}
