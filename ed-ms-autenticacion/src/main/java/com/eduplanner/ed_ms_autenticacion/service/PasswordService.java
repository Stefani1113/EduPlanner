package com.eduplanner.ed_ms_autenticacion.service;

import org.springframework.stereotype.Service;

import com.eduplanner.ed_lib_common.dto.ForgotPasswordRequestDTO;
import com.eduplanner.ed_lib_common.dto.ResetPasswordRequestDTO;
import com.eduplanner.ed_lib_common.notifications.NotificationType;
import com.eduplanner.ed_lib_common.notifications.Notifier;
import com.eduplanner.ed_ms_autenticacion.notifications.NotifierFactory;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;                 
    private final NotifierFactory notifierFactory;  

    /**
     * Recuperación de contraseña
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequestDTO request) {
        Optional<User> userFound = usuarioRepository.findByEmail(request.getEmail());

        // Se responde igual exista o no el correo, para no revelar
        // qué correos están registrados en el sistema (seguridad).
        if (userFound.isEmpty()) {
            return "Si el correo está registrado, se envió un enlace de recuperación";
        }

        String token = jwtService.generatePasswordResetToken(request.getEmail());
        String enlace = "http://localhost:4200/reset-password?token=" + token;

        Notifier notificador = notifierFactory.create(NotificationType.EMAIL);
        notificador.send(
                request.getEmail(),
                "Recuperación de contraseña",
                "Haz clic para restablecer tu contraseña:\n" + enlace + "\n\nExpira en 15 minutos."
        );

        return "Si el correo está registrado, se envió un enlace de recuperación";
    }

    /**
     * Confirmar cambio de contraseña
     */
    @Transactional
    public String resetPassword(ResetPasswordRequestDTO request) {
        String email;
        try {
            email = jwtService.validatePasswordResetToken(request.getToken());
        } catch (RuntimeException e) {
            return e.getMessage(); // "El token expiró" / "Token inválido"
        }

        Optional<User> userFound = usuarioRepository.findByEmail(email);
        if (userFound.isEmpty()) {
            return "Usuario no encontrado";
        }

        User user = userFound.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(user);

        return "Contraseña actualizada correctamente";
    }
}
