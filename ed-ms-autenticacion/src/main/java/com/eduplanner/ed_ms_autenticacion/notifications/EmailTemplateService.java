package com.eduplanner.ed_ms_autenticacion.notifications;

import java.util.Map;

import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import lombok.RequiredArgsConstructor;


/**
 * Servicio para renderizar plantilla Thymeleaf a HTML
 * EmailTemplateService
 */
@Component
@RequiredArgsConstructor
public class EmailTemplateService {
    
    private final TemplateEngine templateEngine;

    public String render(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return templateEngine.process(templateName, context);
    }
}
