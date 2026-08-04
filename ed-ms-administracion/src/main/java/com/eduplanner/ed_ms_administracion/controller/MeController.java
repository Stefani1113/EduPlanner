package com.eduplanner.ed_ms_administracion.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import com.eduplanner.ed_ms_administracion.service.UserQueryService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class MeController {

    private final UserQueryService userQueryService;

    /**
     * Endpoint de mi perfil 
     * @param request
     * @return
     */
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<UserResponseDTO>> getMyProfile(HttpServletRequest request) {
        HttpGlobalResponse<UserResponseDTO> response = new HttpGlobalResponse<>();

z
        try {
            UserResponseDTO user = userQueryService.findById(idUser);
            response.setData(user);
            response.setMessage("Perfil consultado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
    }
}
