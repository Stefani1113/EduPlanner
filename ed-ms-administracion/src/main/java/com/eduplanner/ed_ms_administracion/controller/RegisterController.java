package com.eduplanner.ed_ms_administracion.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.RegisterStaffDTO;
import com.eduplanner.ed_lib_common.dto.RegisterStudentDTO;
import com.eduplanner.ed_ms_administracion.service.RegisterService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/users/register")
@RequiredArgsConstructor
public class RegisterController {

    private final RegisterService registerService;

    @PostMapping("/student")
    public ResponseEntity<HttpGlobalResponse<Void>> resgisterStudent(@RequestBody RegisterStudentDTO dto) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            registerService.registerStudent(dto);
            response.setMessage("Estudiante registrado correctamente. Se envió un correo de activación");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
        response.setMessage(e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (IllegalStateException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PostMapping("/staff")
    public ResponseEntity<HttpGlobalResponse<Void>> registerStaff(@RequestBody RegisterStaffDTO dto) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            registerService.registerStaff(dto);
            response.setMessage("Usuario registrado correctamente. Se envió un correo de activación.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (IllegalStateException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
