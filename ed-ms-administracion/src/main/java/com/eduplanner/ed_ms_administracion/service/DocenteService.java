package com.eduplanner.ed_ms_administracion.service;

import com.eduplanner.ed_lib_common.dto.DocenteRequestDTO;
import com.eduplanner.ed_lib_common.dto.DocenteResponseDTO;
import com.eduplanner.ed_lib_common.entity.Role;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.RoleRepository;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class DocenteService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    private static final int ROL_DOCENTE = 3;

    /** RF 5 - Crear perfil de docente */
    public DocenteResponseDTO crearDocente(DocenteRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con el correo: " + dto.getEmail());
        }
        if (userRepository.existsByDocument(dto.getDocument())) {
            throw new IllegalArgumentException("Ya existe un usuario con el documento: " + dto.getDocument());
        }

        Role role = roleRepository.findById(ROL_DOCENTE)
                .orElseThrow(() -> new RuntimeException("Rol DOCENTE no encontrado en BD"));

        User user = new User();
        mapDtoToEntity(dto, user);
        user.setRole(role);
        user.setStatus(true);

        User saved = userRepository.save(user);
        log.info("Docente creado: {} {}", saved.getName(), saved.getSurnames());
        return toDTO(saved);
    }

    /** RF 5.1 - Editar perfil de docente */
    public DocenteResponseDTO editarDocente(Integer id, DocenteRequestDTO dto) {
        User user = getDocenteOrThrow(id);

        if (!user.getEmail().equalsIgnoreCase(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("El correo ya está en uso por otro usuario");
        }
        if (!user.getDocument().equals(dto.getDocument()) && userRepository.existsByDocument(dto.getDocument())) {
            throw new IllegalArgumentException("El documento ya está en uso por otro usuario");
        }

        mapDtoToEntity(dto, user);

        User saved = userRepository.save(user);
        log.info("Docente actualizado: id={}", id);
        return toDTO(saved);
    }

    /** RF 5.2 - Listar todos los docentes activos */
    public List<DocenteResponseDTO> listarDocentes() {
        return userRepository.findByRoleIdRole(ROL_DOCENTE).stream()
                .filter(User::getStatus)
                .map(this::toDTO)
                .toList();
    }

    /** RF 5.2 - Ver perfil de un docente por id */
    public DocenteResponseDTO obtenerDocente(Integer id) {
        return toDTO(getDocenteOrThrow(id));
    }

    /** RF 5.3 - Baja lógica: status = false */
    public void eliminarDocente(Integer id) {
        User user = getDocenteOrThrow(id);
        user.setStatus(false);
        userRepository.save(user);
        log.info("Docente desactivado: id={}", id);
    }

    /** RF 5.4 - Buscar por nombre, apellido, cargo o área profesional */
    public List<DocenteResponseDTO> buscarDocentes(String query) {
        return userRepository.searchDocentes(query).stream()
                .map(this::toDTO)
                .toList();
    }

    /** RF 5.4 - Filtrar por cargo/posición */
    public List<DocenteResponseDTO> filtrarPorCargo(String position) {
        return userRepository.findDocentesByPosition(position).stream()
                .map(this::toDTO)
                .toList();
    }

    // ---- helpers ----

    private User getDocenteOrThrow(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Docente no encontrado con id: " + id));
        if (user.getRole() == null || user.getRole().getIdRole() != ROL_DOCENTE) {
            throw new RuntimeException("El usuario con id " + id + " no es un docente");
        }
        return user;
    }

    private void mapDtoToEntity(DocenteRequestDTO dto, User user) {
        user.setName(dto.getName());
        user.setSurnames(dto.getSurnames());
        user.setEmail(dto.getEmail().trim().toLowerCase());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setDocumentType(dto.getDocumentType());
        user.setDocument(dto.getDocument());
        user.setDocumentIssuePlace(dto.getDocumentIssuePlace());
        user.setBirthdate(dto.getBirthdate());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setPhotoUrl(dto.getPhotoUrl());
        user.setProfessionalDegrees(dto.getProfessionalDegrees());
        user.setQualificationsDesc(dto.getQualificationsDesc());
        user.setGender(dto.getGender());
        user.setAddress(dto.getAddress());
        user.setBloodType(dto.getBloodType());
        user.setDisabilities(dto.getDisabilities());
        user.setStratum(dto.getStratum());
        user.setPopulationType(dto.getPopulationType());
        user.setHealthRegime(dto.getHealthRegime());
        user.setEps(dto.getEps());
        user.setPosition(dto.getPosition());
        user.setIdInstitution(dto.getIdInstitution());
    }

    private DocenteResponseDTO toDTO(User u) {
        DocenteResponseDTO dto = new DocenteResponseDTO();
        dto.setIdUser(u.getIdUser());
        dto.setName(u.getName());
        dto.setSurnames(u.getSurnames());
        dto.setEmail(u.getEmail());
        dto.setDocumentType(u.getDocumentType());
        dto.setDocument(u.getDocument());
        dto.setDocumentIssuePlace(u.getDocumentIssuePlace());
        dto.setBirthdate(u.getBirthdate());
        dto.setPhoneNumber(u.getPhoneNumber());
        dto.setStatus(u.getStatus());
        dto.setPhotoUrl(u.getPhotoUrl());
        dto.setProfessionalDegrees(u.getProfessionalDegrees());
        dto.setQualificationsDesc(u.getQualificationsDesc());
        dto.setGender(u.getGender());
        dto.setAddress(u.getAddress());
        dto.setBloodType(u.getBloodType());
        dto.setDisabilities(u.getDisabilities());
        dto.setStratum(u.getStratum());
        dto.setPopulationType(u.getPopulationType());
        dto.setHealthRegime(u.getHealthRegime());
        dto.setEps(u.getEps());
        dto.setPosition(u.getPosition());
        dto.setCreationDate(u.getCreationDate());
        dto.setUpdateDate(u.getUpdateDate());
        dto.setIdInstitution(u.getIdInstitution());
        dto.setRol(u.getRole() != null ? u.getRole().getName() : "DOCENTE");
        return dto;
    }
}