package com.eduplanner.ed_ms_administracion.service;

import com.eduplanner.ed_lib_common.dto.TeachingRequestDTO;
import com.eduplanner.ed_lib_common.dto.TeachingResponseDTO;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Log4j2
public class TeachingService {


    private final UserRepository userRepository;

    private static final int TEACHER_ROLE = 2;

    /**
     * RF 5 - La creación de docentes se hace vía RegisterService.registerTeacher(),
     * que sigue el mismo flujo de activación por correo que estudiante/staff
     * (contraseña aleatoria, status pendiente de activación, idInstitution fijo por config).
     */

    /** RF 5.1 - Update teacher profile */
    public TeachingResponseDTO updateTeacher(Integer id, TeachingRequestDTO dto) {
        User user = getTeacherOrThrow(id);

        if (!user.getEmail().equalsIgnoreCase(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use by another user");
        }
        if (!user.getDocument().equals(dto.getDocument()) && userRepository.existsByDocument(dto.getDocument())) {
            throw new IllegalArgumentException("Document already in use by another user");
        }

        mapDtoToEntity(dto, user);

        User saved = userRepository.save(user);
        log.info("Teacher updated: id={}", id);
        return toDTO(saved);
    }

    /** RF 5.2 - List all active teachers */
    public List<TeachingResponseDTO> listTeachers() {
        return userRepository.findByRoleIdRoleAndStatusTrue(TEACHER_ROLE)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /** RF 5.2 - Get teacher profile by id */
    public TeachingResponseDTO getTeacherById(Integer id) {
        return toDTO(getTeacherOrThrow(id));
    }

    /** RF 5.3 - Hard delete: elimina el registro de la base de datos */
    public void deleteTeacher(Integer id) {
        User user = getTeacherOrThrow(id);
        userRepository.delete(user);
        log.info("Teacher deleted from database: id={}", id);
    }

    /** RF 5.4 - Search teachers by name, surnames, position or professional degrees */
    public List<TeachingResponseDTO> searchTeachers(String query) {
        List<User> byName    = userRepository.findByRoleIdRoleAndStatusTrueAndNameContainingIgnoreCase(TEACHER_ROLE, query);
        List<User> bySurname = userRepository.findByRoleIdRoleAndStatusTrueAndSurnamesContainingIgnoreCase(TEACHER_ROLE, query);
        List<User> byPosition = userRepository.findByRoleIdRoleAndStatusTrueAndPositionContainingIgnoreCase(TEACHER_ROLE, query);
        List<User> byDegrees  = userRepository.findByRoleIdRoleAndStatusTrueAndProfessionalDegreesContainingIgnoreCase(TEACHER_ROLE, query);

        return Stream.of(byName, bySurname, byPosition, byDegrees)
                .flatMap(List::stream)
                .collect(Collectors.toMap(User::getIdUser, u -> u, (a, b) -> a))
                .values().stream()
                .map(this::toDTO)
                .toList();
    }

    /** RF 5.4 - Filter teachers by position */
    public List<TeachingResponseDTO> filterByPosition(String position) {
        return userRepository.findByRoleIdRoleAndStatusTrueAndPositionContainingIgnoreCase(TEACHER_ROLE, position)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ---- private helpers ----

    private User getTeacherOrThrow(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
        if (user.getRole() == null || user.getRole().getIdRole() != TEACHER_ROLE) {
            throw new RuntimeException("User with id " + id + " is not a teacher");
        }
        return user;
    }

    private void mapDtoToEntity(TeachingRequestDTO dto, User user) {
        user.setName(dto.getName());
        user.setSurnames(dto.getSurnames());
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setDocumentType(dto.getDocumentType());
        user.setDocument(dto.getDocument());
        user.setDocumentIssuePlace(dto.getDocumentIssuePlace());
        user.setBirthdate(dto.getBirthdate());
        user.setPhoneNumber(dto.getPhoneNumber());
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
    }

    private TeachingResponseDTO toDTO(User u) {
        TeachingResponseDTO dto = new TeachingResponseDTO();
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
