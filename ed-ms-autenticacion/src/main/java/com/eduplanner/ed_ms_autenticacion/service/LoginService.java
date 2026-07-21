package com.eduplanner.ed_ms_autenticacion.service;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.JwtDTO;
import com.eduplanner.ed_lib_common.dto.LoginRequestDTO;
import com.eduplanner.ed_lib_common.dto.LoginResponseDTO;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_ms_autenticacion.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * RF 1.2 / RF 1.2.1 / RF 1.2.1.1
     * Autentica con correo + contraseña. Errores descriptivos e instantáneos.
     */
    public HttpGlobalResponse<LoginResponseDTO> login(LoginRequestDTO request) {
        HttpGlobalResponse<LoginResponseDTO> response = new HttpGlobalResponse<>();

        Optional<User> found = userRepository.findByEmail(request.getEmail());

        // RF 1.2.1.1 - El correo no existe
        if (found.isEmpty()) {
            response.setMessage("El correo no está registrado en el sistema");
            return response;
        }
        User user = found.get();
        // user inactivo
        if (Boolean.FALSE.equals(user.getStatus())) {
            response.setMessage("La cuenta está desactivada. Contacte al administrador.");
            return response;
        }

        // RF 1.2.1.1 - Contraseña incorrecta
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.setMessage("Contraseña incorrecta. Verifique sus credenciales.");
            return response;
        }

        String token = jwtService.generateToken(
                user.getIdUser(),
                user.getRole().getIdRole(),
                user.getEmail()
        );

        LoginResponseDTO data = new LoginResponseDTO();
        data.setToken(token);
        data.setIdUser(user.getIdUser());
        data.setName(user.getName());
        data.setLastName(user.getSurnames());
        data.setEmail(user.getEmail());
        data.setRole(RolEnum.fromId(user.getRole().getIdRole()).name());

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

}