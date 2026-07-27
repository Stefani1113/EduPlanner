package com.eduplanner.ed_ms_administracion.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserQueryService {
    
    private final UserRepository userRepository;

    public List<UserResponseDTO> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::fromEntity)
                .toList();
    }

    public List<UserResponseDTO> findByRole(Integer idRole) {
        return userRepository.findByRoleIdRole(idRole).stream()
                .map(UserResponseDTO::fromEntity)
                .toList();
    }

    public UserResponseDTO findById(Integer idUser) {
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + idUser));
        return UserResponseDTO.fromEntity(user);
    }
}
