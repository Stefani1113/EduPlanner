package com.eduplanner.ed_ms_autenticacion.service;

import com.eduplanner.ed_lib_comun.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_comun.dto.UserResponseDTO;
import com.eduplanner.ed_lib_comun.dto.UpdateRolRequestDTO;

import com.eduplanner.ed_ms_autenticacion.entity.User;
import com.eduplanner.ed_lib_comun.enums.RolEnum;
import com.eduplanner.ed_ms_autenticacion.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsuarioRepository usuarioRepository;

    /** RF 6.2 - Lista todos los usuarios */
    public List<UserResponseDTO> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** RF 6.2 - Obtiene un usuario por ID */
    public UserResponseDTO obtenerPorId(Long id) {
        return toDTO(buscarOFallar(id));
    }

    /** RF 6.2 - Lista usuarios por rol */
    public List<UserResponseDTO> listarPorRol(Integer idRol) {
        RolEnum.fromId(idRol); // valida que el rol exista
        return usuarioRepository.findByIdRole(idRol)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** RF 6.2 - Actualiza el rol de un usuario */
    public HttpGlobalResponse<UserResponseDTO> actualizarRol(Long idUsuario, UpdateRolRequestDTO request) {
        HttpGlobalResponse<UserResponseDTO> response = new HttpGlobalResponse<>();
        try {
            RolEnum.fromId(request.getIdRole());
        } catch (IllegalArgumentException e) {
            response.setMessage("Rol inválido. Use: 1=ADMINISTRADOR, 2=ESTUDIANTE, 3=DOCENTE, 4=SISTEMA");
            return response;
        }
        User usuario = buscarOFallar(idUsuario);
        usuario.setIdRole(request.getIdRole());
        usuarioRepository.save(usuario);
        response.setMessage("Rol actualizado correctamente");
        response.setData(toDTO(usuario));
        return response;
    }

    /** RF 6.2 - Activa o desactiva un usuario */
    public HttpGlobalResponse<UserResponseDTO> cambiarEstado(Long idUsuario, Boolean estado) {
        HttpGlobalResponse<UserResponseDTO> response = new HttpGlobalResponse<>();
        User usuario = buscarOFallar(idUsuario);
        usuario.setState(estado);
        usuarioRepository.save(usuario);
        response.setMessage(estado ? "Usuario activado correctamente" : "Usuario desactivado correctamente");
        response.setData(toDTO(usuario));
        return response;
    }

    private User buscarOFallar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
    }

    private UserResponseDTO toDTO(User u) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setIdUser(u.getIdUser());
        dto.setName(u.getName());
        dto.setLasName(u.getSurnames());
        dto.setEmail(u.getEmail());
        dto.setDocument(u.getDocument());
        dto.setDocumentType(u.getDocumentType());
        dto.setPhoneNumber(u.getPhoneNumber());
        dto.setBirthdate(u.getBirthdate());
        dto.setState(u.getState());
        dto.setCreationDate(u.getCreationDate());
        dto.setLastAccess(u.getLassAccess());
        dto.setIdRole(u.getIdRole());
        dto.setRoleName(RolEnum.fromId(u.getIdRole()).name());
        return dto;
    }
}
