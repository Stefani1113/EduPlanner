package com.EduPlanner.ed_ms_gestion_academica.notifications;

public interface Notification {

    void send(
            Integer idUser,
            String title,
            String message,
            Integer idSchedule
    );
}