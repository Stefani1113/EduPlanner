package com.eduplanner.ed_ms_administracion.service;

import com.eduplanner.ed_lib_common.dto.SupportRequestRequestDTO;
import com.eduplanner.ed_lib_common.entity.SupportRequest;
import com.eduplanner.ed_lib_common.notifications.NotificationType;
import com.eduplanner.ed_ms_administracion.notifications.EmailTemplateService;
import com.eduplanner.ed_ms_administracion.notifications.NotifierFactory;
import com.eduplanner.ed_ms_administracion.repository.SupportRequestRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SupportRequestService {

    private final SupportRequestRepository repository;
    private final NotifierFactory notifierFactory;
    private final EmailTemplateService emailTemplateService;

    @Value("${app.mail.support-team}")
    private String supportTeamEmail;

    @Transactional
    public void submit(SupportRequestRequestDTO dto) {
        //Guardar en la base de datos
        SupportRequest request = new SupportRequest();
        request.setSenderName(dto.getSenderName());
        request.setSenderEmail(dto.getSenderEmail());
        request.setSubject(dto.getSubject());
        request.setMessage(dto.getMessage());
        repository.save(request);

        //Enviar correo de notificación al equipo de soporte
        String htmlBody = emailTemplateService.render(
                "email/support_request",
                Map.of(
                        "senderName", dto.getSenderName(),
                        "senderEmail", dto.getSenderEmail(),
                        "subject", dto.getSubject(),
                        "message", dto.getMessage()
                )
        );

        notifierFactory.create(NotificationType.EMAIL)
                .send(supportTeamEmail, "Nueva solicitud de soporte: " + dto.getSubject(), htmlBody);
    }
}