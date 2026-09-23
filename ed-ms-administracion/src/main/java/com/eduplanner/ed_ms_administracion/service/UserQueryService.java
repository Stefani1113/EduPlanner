package com.eduplanner.ed_ms_administracion.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Servicio para búsqueda de usuarios
 *
 * Listar todos
 * Por rol
 * Por nombre
 * Por id
 * Por curso
 */
@Service
@RequiredArgsConstructor
public class UserQueryService {

    private final UserRepository userRepository;

    /**
     * Consultar todos los usuarios paginados.
     */
    public Page<UserResponseDTO> findAll(Pageable pageable) {

        return userRepository.findAll(pageable)
                .map(UserResponseDTO::fromEntity);
    }

    /**
     * Consultar usuarios por rol paginados.
     */
    public Page<UserResponseDTO> findByRole(
            Integer idRole,
            Pageable pageable) {

        return userRepository.findByRoleIdRole(idRole, pageable)
                .map(UserResponseDTO::fromEntity);
    }

    /**
     * Buscar usuarios por nombre paginados.
     */
    public Page<UserResponseDTO> findByName(
            String name,
            Pageable pageable) {

        return userRepository.findByNameContainingIgnoreCase(
                        name,
                        pageable
                )
                .map(UserResponseDTO::fromEntity);
    }

    /**
     * Consultar usuario por ID.
     */
    public UserResponseDTO findById(Integer idUser) {

        User user = userRepository.findById(idUser)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Usuario no encontrado con id: " + idUser
                        )
                );

        return UserResponseDTO.fromEntity(user);
    }

    /**
     * Consultar estudiantes de un curso paginados.
     */
    public Page<UserResponseDTO> findByCourse(
            Integer idCourse,
            Pageable pageable) {

        return userRepository.findByIdCourse(idCourse, pageable)
                .map(UserResponseDTO::fromEntity);
    }
}