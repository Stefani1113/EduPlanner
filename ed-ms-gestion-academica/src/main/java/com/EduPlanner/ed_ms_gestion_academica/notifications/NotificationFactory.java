package com.EduPlanner.ed_ms_gestion_academica.notifications;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationFactory {

    private final WebSocketNotification webSocketNotification;

    public Notification createNotification() {
        return webSocketNotification;
    }
}