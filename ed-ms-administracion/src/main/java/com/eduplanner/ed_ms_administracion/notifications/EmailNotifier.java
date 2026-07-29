package com.eduplanner.ed_ms_administracion.notifications;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import com.eduplanner.ed_lib_common.notifications.Notifier;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailNotifier implements Notifier {
    
    private final JavaMailSender mailSender;

    @Override
    public void send(String addressee, String topic, String message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(addressee);
        mail.setSubject(topic);
        mail.setText(message);
        mailSender.send(mail);
    }
    
}
