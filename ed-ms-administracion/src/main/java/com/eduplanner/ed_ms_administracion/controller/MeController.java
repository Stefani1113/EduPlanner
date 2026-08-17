package com.eduplanner.ed_ms_administracion.controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import com.eduplanner.ed_ms_administracion.service.PhotoService;
import com.eduplanner.ed_ms_administracion.service.UserQueryService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class MeController {

    private final UserQueryService userQueryService;
    
    private final PhotoService photoService;

    /**
     * Endpoint de mi perfil 
     * @param request
     * @return
     */
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<UserResponseDTO>> getMyProfile(HttpServletRequest request) {
        HttpGlobalResponse<UserResponseDTO> response = new HttpGlobalResponse<>();


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

    @PostMapping("/photo")
    public ResponseEntity<HttpGlobalResponse<String>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        HttpGlobalResponse<String> response = new HttpGlobalResponse<>();

        Integer idUserInteger = (Integer) request.getAttribute("idUser");
        Integer idUser = idUserInteger.intValue();

        try {
            String url = photoService.uploadProfilePhoto(idUser, file);
            response.setData(url);
            response.setMessage("Foto de perfil actualizada correctamente");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (IOException e) {
            response.setMessage("Error al subir la imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Integer extractIdUser(HttpServletRequest request) {
        Integer idUserInt = (Integer) request.getAttribute("idUser");
        return idUserInt.intValue();
    }
}
