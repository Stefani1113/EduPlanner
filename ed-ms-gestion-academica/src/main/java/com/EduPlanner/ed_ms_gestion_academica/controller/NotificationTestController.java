package com.EduPlanner.ed_ms_gestion_academica.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EduPlanner.ed_ms_gestion_academica.notifications.Notification;
import com.EduPlanner.ed_ms_gestion_academica.notifications.NotificationFactory;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/test/notifications")
@RequiredArgsConstructor
public class NotificationTestController {

    private final NotificationFactory notificationFactory;

    @PostMapping("/{idUser}")
    public void testNotification(@PathVariable Integer idUser) {

        Notification notification =
                notificationFactory.createNotification();

        notification.send(
                idUser,
                "Horario actualizado",
                "Tu horario académico ha sido actualizado.",
                1
        );
    }
}