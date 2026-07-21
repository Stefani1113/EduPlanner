package com.eduplanner.ed_ms_autenticacion.notifications;

import org.springframework.stereotype.Component;

import com.eduplanner.ed_lib_common.notifications.NotificationType;
import com.eduplanner.ed_lib_common.notifications.Notifier;

import lombok.RequiredArgsConstructor;

/**
 * Se implementa factory method
 * Decide que implementación de Notificator entregar
 * NotifierFactory
 */
@Component
@RequiredArgsConstructor
public class NotifierFactory {
    
    private final EmailNotifier emailNotifier;

    public Notifier create(NotificationType type) {
        return switch (type) {
            case EMAIL -> emailNotifier;
        };
    }
}
