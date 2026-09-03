package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.entity.SupportRequest;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SupportRequestResponseDTO {
    private Integer idSupportRequest;
    private String senderName;
    private String senderEmail;
    private String subject;
    private String message;
    private String status;
    private LocalDateTime createdAt;

    public static SupportRequestResponseDTO fromEntity(SupportRequest s) {
        SupportRequestResponseDTO dto = new SupportRequestResponseDTO();
        dto.setIdSupportRequest(s.getIdSupportRequest());
        dto.setSenderName(s.getSenderName());
        dto.setSenderEmail(s.getSenderEmail());
        dto.setSubject(s.getSubject());
        dto.setMessage(s.getMessage());
        dto.setStatus(s.getStatus().name());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}