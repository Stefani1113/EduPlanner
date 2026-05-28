package com.eduplanner.ed_ms_autenticacion.service;

import com.eduplanner.ed_lib_comun.dto.ForgotPasswordRequestDTO;
import com.eduplanner.ed_lib_comun.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_comun.dto.JwtDTO;
import com.eduplanner.ed_lib_comun.dto.LoginRequestDTO;
import com.eduplanner.ed_lib_comun.dto.LoginResponseDTO;
import com.eduplanner.ed_lib_comun.dto.ResetPasswordRequestDTO;

import com.eduplanner.ed_ms_autenticacion.entity.User;
import com.eduplanner.ed_lib_comun.enums.RolEnum;
import com.eduplanner.ed_ms_autenticacion.repository.UsuarioRepository;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * RF 1.2 / RF 1.2.1 / RF 1.2.1.1
     * Autentica con correo + contraseña. Errores descriptivos e instantáneos.
     */
    public HttpGlobalResponse<LoginResponseDTO> login(LoginRequestDTO request) {
        HttpGlobalResponse<LoginResponseDTO> response = new HttpGlobalResponse<>();

        Optional<User> found = usuarioRepository.findByEmail(request.getEmail());

        // RF 1.2.1.1 - El correo no existe
        if (found.isEmpty()) {
            response.setMessage("El correo no está registrado en el sistema");
            return response;
        }
        User usuario = found.get();
        // Usuario inactivo
        if (Boolean.FALSE.equals(usuario.getState())) {
            response.setMessage("La cuenta está desactivada. Contacte al administrador.");
            return response;
        }

        // RF 1.2.1.1 - Contraseña incorrecta
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            response.setMessage("Contraseña incorrecta. Verifique sus credenciales.");
            return response;
        }

        // Registrar último acceso
        usuario.setLassAccess(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(
                usuario.getIdUser(),
                usuario.getIdRole(),
                usuario.getEmail()
        );

        LoginResponseDTO data = new LoginResponseDTO();
        data.setToken(token);
        data.setIdUser(usuario.getIdUser());
        data.setName(usuario.getName());
        data.setLastName(usuario.getSurnames());
        data.setEmail(usuario.getEmail());
        data.setRole(RolEnum.fromId(usuario.getIdRole()).name());

        response.setMessage("Inicio de sesión exitoso");
        response.setData(data);
        return response;
    }

    /**
     * RF 1.6 - Cierre de sesión. Invalida el token.
     */
    public HttpGlobalResponse<Void> logout(String token) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        tokenBlacklistService.blacklist(token);
        response.setMessage("Sesión cerrada correctamente");
        return response;
        
    }

        /**
     * Refresco del JWT
     */
    public JwtDTO refreshToken(String token) throws Exception {
        if (tokenBlacklistService.isBlacklisted(token)) {
            throw new Exception("Token revocado. Inicie sesión nuevamente.");
        }
        JwtDTO dto = new JwtDTO();
        dto.setToken(jwtService.refreshToken(token));
        return dto;
    }

    /**
     * Petición para restablecimiento de contraseña
     * @param request
     * @return
     */
    @Transactional
        public String forgotPassword(ForgotPasswordRequestDTO request) {
        Optional<User> userFound =
                usuarioRepository.findByEmail(request.getEmail());

        if (userFound.isEmpty()) {
            return "Usuario no encontrado";
        }

        // Generar token JWT firmado
        String token = jwtService.generatePasswordResetToken(request.getEmail());

        System.out.println("TOKEN DE RESET: " + token);

        return "Token generado correctamente";
    }

    @Transactional
        public String resetPassword(ResetPasswordRequestDTO request) {
        String email;

        try {
            email = jwtService.validatePasswordResetToken(request.getToken());
        } catch (RuntimeException e) {
            return e.getMessage(); 
        }

        Optional<User> userFound =
                usuarioRepository.findByEmail(email);

        if (userFound.isEmpty()) {
            return "Usuario no encontrado";
        }

        User user = userFound.get();

        // Encriptar y guarda nueva contraseña
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );
        usuarioRepository.save(user);

        return "Contraseña actualizada correctamente";
    }
}
