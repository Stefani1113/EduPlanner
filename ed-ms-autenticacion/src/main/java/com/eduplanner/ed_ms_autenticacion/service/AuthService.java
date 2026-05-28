package com.eduplanner.ed_ms_autenticacion.service;

import com.eduplanner.ed_lib_comun.dto.ForgotPasswordRequestDTO;
import com.eduplanner.ed_lib_comun.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_comun.dto.JwtDTO;
import com.eduplanner.ed_lib_comun.dto.LoginRequestDTO;
import com.eduplanner.ed_lib_comun.dto.LoginResponseDTO;
import com.eduplanner.ed_lib_comun.dto.ResetPasswordRequestDTO;

import eduplanner.ed_ms_autenticacion.entity.User;
import com.eduplanner.ed_lib_comun.enums.RolEnum;
import eduplanner.ed_ms_autenticacion.repository.UsuarioRepository;
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
}