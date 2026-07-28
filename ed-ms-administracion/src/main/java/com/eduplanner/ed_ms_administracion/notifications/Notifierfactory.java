package com.eduplanner.ed_ms_administracion.notifications;

import org.springframework.stereotype.Component;

import com.eduplanner.ed_lib_common.notifications.NotificationType;
import com.eduplanner.ed_lib_common.notifications.Notifier;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class Notifierfactory {
    
    private final EmailNotifier emailNotifier;

    public Notifier create(NotificationType type) {
        return switch (type) {
            case EMAIL -> emailNotifier;
        };
    }
}
