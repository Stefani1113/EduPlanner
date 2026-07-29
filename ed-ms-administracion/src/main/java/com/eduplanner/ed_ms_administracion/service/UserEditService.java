package com.eduplanner.ed_ms_administracion.service;

import com.eduplanner.ed_lib_common.dto.*;
import com.eduplanner.ed_lib_common.entity.Guardian;
import com.eduplanner.ed_lib_common.entity.Role;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_ms_administracion.repository.GuardianRepository;
import com.eduplanner.ed_ms_administracion.repository.RoleRepository;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserEditService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GuardianRepository guardianRepository;


    //Actualizar estudiantes
    @Transactional
    public void updateStudent(Integer idUser, UpdateStudentDTO dto) {
        User user = getUserOrThrow(idUser);
        applyCommonFields(user, dto.getName(), dto.getSurnames(), dto.getPhoneNumber(),
                dto.getDocumentIssuePlace(), dto.getGender(), dto.getBirthdate(),
                dto.getAddress(), dto.getBloodType(), dto.getDisabilities(),
                dto.getStratum(), dto.getPopulationType(), dto.getHealthRegime(), dto.getEps());
        userRepository.save(user);

        if (dto.getGuardian() != null) {
            Guardian guardian = guardianRepository.findByIdUser(idUser)
                    .orElseThrow(() -> new IllegalStateException("El estudiante no tiene acudiente registrado"));
            guardian.setGuardianName(dto.getGuardian().getGuardianName());
            guardian.setGuardianPhone(dto.getGuardian().getGuardianPhone());
            guardianRepository.save(guardian);
        }
    }

    //Actualizar Staff (administrador, directivo)
    @Transactional
    public void updateStaff(Integer idUser, UpdateStaffDTO dto) {
        User user = getUserOrThrow(idUser);
        applyCommonFields(user, dto.getName(), dto.getSurnames(), dto.getPhoneNumber(),
                dto.getDocumentIssuePlace(), dto.getGender(), dto.getBirthdate(),
                dto.getAddress(), dto.getBloodType(), dto.getDisabilities(),
                dto.getStratum(), dto.getPopulationType(), dto.getHealthRegime(), dto.getEps());
        user.setPosition(dto.getPosition());
        userRepository.save(user);
    }

    //Actualizar rol

    /**
     * Restricicones de cambio de rol
     */
    private static final Map<Integer, Set<Integer>> ALLOWED_ROLE_TRANSITIONS = Map.of(
        RolEnum.ESTUDIANTE.getId(), Set.of(),
        RolEnum.DOCENTE.getId(), Set.of(RolEnum.ADMINISTRADOR.getId(), RolEnum.DIRECTIVO.getId()),
        RolEnum.ADMINISTRADOR.getId(), Set.of(RolEnum.DIRECTIVO.getId()),
        RolEnum.DIRECTIVO.getId(), Set.of(RolEnum.ADMINISTRADOR.getId())
    );

    @Transactional
    public void updateRole(Integer idUser, UpdateRoleDTO dto) {
        User user = getUserOrThrow(idUser);
        Integer currentRoleId = user.getRole().getIdRole();
        Integer targetRoleId = dto.getIdRole();

        if (currentRoleId.equals(targetRoleId)) {
            throw new IllegalArgumentException("El usuario ya tiene ese rol");
        }

        Set<Integer> allowedTargets = ALLOWED_ROLE_TRANSITIONS.getOrDefault(currentRoleId, Set.of());
        if (!allowedTargets.contains(targetRoleId)) {
            throw new IllegalArgumentException( "No se permite cambiar del rol actual al rol solicitado");
        }

        boolean targetIsStaff = targetRoleId.equals(RolEnum.ADMINISTRADOR.getId())
                || targetRoleId.equals(RolEnum.DIRECTIVO.getId());

        if (targetIsStaff && (dto.getPosition() == null || dto.getPosition().isBlank())) {
            throw new IllegalArgumentException( "Debe indicar el nuevo cargo (posición) al cambiar a Administrador o Directivo" );
        }

        Role newRole = roleRepository.findById(targetRoleId)
                .orElseThrow(() -> new IllegalArgumentException( "Rol no válido: " + targetRoleId ));

        user.setRole(newRole);
        if (targetIsStaff) {
            user.setPosition(dto.getPosition());
        }

        userRepository.save(user);
    }

    //Actualizar estado
    @Transactional
    public void updateStatus(Integer idUser, UpdateStatusDTO dto) {
        User user = getUserOrThrow(idUser);
        user.setStatus(dto.getStatus());
        userRepository.save(user);
    }

    private User getUserOrThrow(Integer idUser) {
        return userRepository.findById(idUser)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + idUser));
    }

    private void applyCommonFields(User user, String name, String surnames, String phoneNumber,
                                    String documentIssuePlace, String gender, java.time.LocalDate birthdate,
                                    String address, String bloodType, String disabilities,
                                    Integer stratum, String populationType, String healthRegime, String eps) {
        user.setName(name);
        user.setSurnames(surnames);
        user.setPhoneNumber(phoneNumber);
        user.setDocumentIssuePlace(documentIssuePlace);
        user.setGender(gender);
        user.setBirthdate(birthdate);
        user.setAddress(address);
        user.setBloodType(bloodType);
        user.setDisabilities(disabilities);
        user.setStratum(stratum);
        user.setPopulationType(populationType);
        user.setHealthRegime(healthRegime);
        user.setEps(eps);
    }
}