package com.eduplanner.ed_lib_common.notifications;

/**
 * Cualquier forma de notificar debe saber enviar
 */
public interface Notifier{

    void send (String addressee, String topic, String message);
}
