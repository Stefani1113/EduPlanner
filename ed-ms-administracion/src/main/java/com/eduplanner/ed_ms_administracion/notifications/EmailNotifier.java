package com.eduplanner.ed_ms_administracion.notifications;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.eduplanner.ed_lib_common.notifications.Notifier;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailNotifier implements Notifier {
    
    private final JavaMailSender mailSender;

    @Override
    public void send(String addressee, String topic, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(addressee);
            helper.setSubject(topic);
            helper.setText(message, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new IllegalStateException("Error al enviar el correo a " + addressee, e);
        }
    }
}
