package eduplanner.ed_ms_autenticacion.controller;

import com.eduplanner.ed_lib_comun.dto.ForgotPasswordRequestDTO;
import com.eduplanner.ed_lib_comun.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_comun.dto.JwtDTO;
import com.eduplanner.ed_lib_comun.dto.LoginRequestDTO;
import com.eduplanner.ed_lib_comun.dto.LoginResponseDTO;
import com.eduplanner.ed_lib_comun.dto.ResetPasswordRequestDTO;

import eduplanner.ed_ms_autenticacion.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    /**
     * RF 1.2 / RF 1.2.1 / RF 1.2.1.1
     * POST /eduplanner/auth/login
     * Autentica con correo + contraseña. Respuesta inmediata con mensajes descriptivos.
     */
    @PostMapping("/login")
    public ResponseEntity<HttpGlobalResponse<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        HttpGlobalResponse<LoginResponseDTO> response = authService.login(request);
        if (response.getData() == null) {
            // RF 1.2.1.1 - Error de credenciales, respuesta inmediata
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * RF 1.6 - Cierre de sesión
     * POST /eduplanner/auth/logout
     * Invalida el token actual.
     */
    @PostMapping("/logout")
    public ResponseEntity<HttpGlobalResponse<Void>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            HttpGlobalResponse<Void> err = new HttpGlobalResponse<>();
            err.setMessage("No se encontró token de sesión");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        return ResponseEntity.ok(authService.logout(authHeader.substring(7)));
    }

    /**
     * GET /eduplanner/auth/refresh
     * Renueva el token antes de que expire.
     */
    @GetMapping("/refresh")
    public ResponseEntity<JwtDTO> refresh(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(authService.refreshToken(authHeader.substring(7)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Solicita recuperación de contraseña
     * @param request
     * @return
     */
        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(
        @RequestBody
        ForgotPasswordRequestDTO request){
        
            String result = authService.forgotPassword(request);
        
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
        
        return ResponseEntity.ok(response);
        }

}