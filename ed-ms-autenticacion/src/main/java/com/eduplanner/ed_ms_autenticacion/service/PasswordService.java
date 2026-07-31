package com.eduplanner.ed_ms_autenticacion.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.eduplanner.ed_lib_common.dto.ForgotPasswordRequestDTO;
import com.eduplanner.ed_lib_common.dto.TokenPasswordDTO;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_lib_common.notifications.NotificationType;
import com.eduplanner.ed_lib_common.notifications.Notifier;
import com.eduplanner.ed_ms_autenticacion.notifications.EmailTemplateService;
import com.eduplanner.ed_ms_autenticacion.notifications.NotifierFactory;
import com.eduplanner.ed_ms_autenticacion.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;                 
    private final NotifierFactory notifierFactory;
    private final EmailTemplateService emailTemplateService;


    private static final int EXPIRATION_MINUTES = 10;

    /**
     * Recuperación de contraseña
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequestDTO request) {
        Optional<User> userFound = userRepository.findByEmail(request.getEmail());

        // Se responde igual exista o no el correo, para no revelar
        // qué correos están registrados en el sistema (seguridad).
        if (userFound.isEmpty()) {
            return "Si el correo está registrado, se envió un enlace de recuperación";
        }

        User user = userFound.get();

        String token = jwtService.generatePasswordResetToken(request.getEmail());
        String link = "http://localhost:4200/auth/reset-password?token=" + token;

        Map<String, Object> variables = Map.of(
                "name", user.getName(),
                "resetLink", link,
                "expirationMinutes", EXPIRATION_MINUTES
        );

        String htmlContent = emailTemplateService.render("email/reset-password", variables);
        
        Notifier notificator = notifierFactory.create(NotificationType.EMAIL);
        notificator.send(
            request.getEmail(),
            "Recuperación de contraseña",
            htmlContent
        );

        return "Si el correo está registrado, se envió un enlace de recuperación";
    }

    /**
     * Confirmar cambio de contraseña
     */
    @Transactional
    public String resetPassword(TokenPasswordDTO request) {
        String email;
        try {
            email = jwtService.validatePasswordResetToken(request.getToken());
        } catch (RuntimeException e) {
            return e.getMessage(); // "El token expiró" / "Token inválido"
        }

        Optional<User> userFound = userRepository.findByEmail(email);
        if (userFound.isEmpty()) {
            return "Usuario no encontrado";
        }

        User user = userFound.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Contraseña actualizada correctamente";
    }

    /**
     * Método para activación de cuenta
     * @param request
     */

    public void activationAccount(TokenPasswordDTO request) {
        String email = jwtService.validateAccountActivationToken(request.getToken());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setStatus(true); // Activa la cuenta
        userRepository.save(user);
    }
}
