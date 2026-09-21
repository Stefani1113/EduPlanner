package com.EduPlanner.ed_ms_gestion_academica.notifications;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.eduplanner.ed_lib_common.dto.ScheduleNotificationDTO;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketNotification implements Notification {


        private final SimpMessagingTemplate messagingTemplate;

        @Override
        public void send(
                Integer idUser,
                String title,
                String message,
                Integer idSchedule) {

                ScheduleNotificationDTO notification =
                        new ScheduleNotificationDTO(
                                "SCHEDULE_UPDATED",
                                title,
                                message,
                                idSchedule
                        );

                messagingTemplate.convertAndSend(
                        "/topic/user/" + idUser,
                        notification
                );
        }
}