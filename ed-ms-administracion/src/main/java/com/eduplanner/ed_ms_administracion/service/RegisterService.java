package com.eduplanner.ed_ms_administracion.service;

import com.eduplanner.ed_lib_common.dto.RegisterStaffDTO;
import com.eduplanner.ed_lib_common.dto.RegisterStudentDTO;
import com.eduplanner.ed_lib_common.entity.Guardian;
import com.eduplanner.ed_lib_common.entity.Role;
import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_lib_common.notifications.NotificationType;
import com.eduplanner.ed_ms_administracion.client.AuthServiceClient;

import com.eduplanner.ed_ms_administracion.notifications.Notifierfactory;
import com.eduplanner.ed_ms_administracion.repository.GuardianRepository;
import com.eduplanner.ed_ms_administracion.repository.ImportRepository;
import com.eduplanner.ed_ms_administracion.repository.RoleRepository;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegisterService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GuardianRepository guardianRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthServiceClient authServiceClient;
    private final Notifierfactory notifierFactory;
    private final ImportRepository importRepository;

    @Value("${institution.id}")
    private Integer institutionId;

    @Value("${frontend.activation-url}")
    private String activationUrlBase;

    // REGISTRO DE ESTUDIANTE
    @Transactional
    public void registerStudent(RegisterStudentDTO dto) {
        registerStudentInternal(dto, null);
    }

    @Transactional
    public void registerStudentInternal(RegisterStudentDTO dto, Integer idImport) {
        validateNotDuplicated(dto.getEmail(), dto.getDocument());

        Role role = getRoleOrThrow(RolEnum.ESTUDIANTE.getId());

        User user = buildBaseUser(
                dto.getEmail(), dto.getName(), dto.getSurnames(),
                dto.getDocumentType(), dto.getDocument(), dto.getDocumentIssuePlace(),
                dto.getBirthdate(), dto.getPhoneNumber(), dto.getGender(),
                dto.getAddress(), dto.getBloodType(), dto.getDisabilities(),
                dto.getStratum(), dto.getPopulationType(), dto.getHealthRegime(), dto.getEps()
        );
        user.setPosition("Estudiante");
        user.setRole(role);
        
        //Si viene de una importación, se asocia el resgistro Import correspondiente;
        //Se el resgitro es manual queda null
        if (idImport != null) {
            user.setImportEntity(importRepository.getReferenceById(idImport));
        }

        userRepository.save(user);

        // Guardar el acudiente asociado, solo aplica para estudiantes
        Guardian guardian = new Guardian();
        guardian.setGuardianName(dto.getGuardian().getGuardianName());
        guardian.setGuardianPhone(dto.getGuardian().getGuardianPhone());
        guardian.setIdUser(user);
        guardianRepository.save(guardian);

        sendActivationEmail(user);
    }

    // REGISTRO DE ADMINISTRADOR / DIRECTIVO
    @Transactional
    public void registerStaff(RegisterStaffDTO dto) {
        validateNotDuplicated(dto.getEmail(), dto.getDocument());

        // idRole viene del DTO porque este endpoint cubre 2 roles distintos
        if (!dto.getIdRole().equals(RolEnum.ADMINISTRADOR.getId())
                && !dto.getIdRole().equals(RolEnum.DIRECTIVO.getId())) {
            throw new IllegalArgumentException("Rol inválido para este tipo de registro");
        }
        Role role = getRoleOrThrow(dto.getIdRole());

        User user = buildBaseUser(
                dto.getEmail(), dto.getName(), dto.getSurnames(),
                dto.getDocumentType(), dto.getDocument(), dto.getDocumentIssuePlace(),
                dto.getBirthdate(), dto.getPhoneNumber(), dto.getGender(),
                dto.getAddress(), dto.getBloodType(), dto.getDisabilities(),
                dto.getStratum(), dto.getPopulationType(), dto.getHealthRegime(), dto.getEps()
        );
        user.setPosition(dto.getPosition());
        user.setRole(role);

        userRepository.save(user);

        sendActivationEmail(user);
    }


    private void validateNotDuplicated(String email, String document) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        if (userRepository.existsByDocument(document)) {
            throw new IllegalArgumentException("El documento ya está registrado");
        }
    }

    private Role getRoleOrThrow(Integer idRole) {
        return roleRepository.findById(idRole)
                .orElseThrow(() -> new IllegalStateException("Rol no configurado en la base de datos: " + idRole));
    }

    /**
     * User con los campos comunes a los 2 roles.
     */
    private User buildBaseUser(String email, String name, String surnames,
                                String documentType, String document, String documentIssuePlace,
                                java.time.LocalDate birthdate, String phoneNumber, String gender,
                                String address, String bloodType, String disabilities,
                                Integer stratum, String populationType, String healthRegime, String eps) {

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setSurnames(surnames);
        user.setDocumentType(documentType);
        user.setDocument(document);
        user.setDocumentIssuePlace(documentIssuePlace);
        user.setBirthdate(birthdate);
        user.setPhoneNumber(phoneNumber);
        user.setGender(gender);
        user.setAddress(address);
        user.setBloodType(bloodType);
        user.setDisabilities(disabilities);
        user.setStratum(stratum);
        user.setPopulationType(populationType);
        user.setHealthRegime(healthRegime);
        user.setEps(eps);
        user.setIdInstitution(institutionId);

        // Contraseña temporal aleatoria: el usuario la define al activar la cuenta
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        // La cuenta nace desactivada, pendiente de que el usuario la active por correo
        user.setStatus(false);

        return user;
    }

    /**
     * Pide el token de activación a ed-ms-autenticacion (vía HTTP)
     * y envía el correo con el enlace de activación.
     */
    private void sendActivationEmail(User user) {
        String activationToken = authServiceClient.requestActivationToken(user.getEmail());
        String activationLink = activationUrlBase + "?token=" + activationToken;

        String message = "Hola " + user.getName() + ",\n\n"
                + "Tu cuenta en EduPlanner fue creada. Haz clic en el siguiente enlace para activarla "
                + "y definir tu contraseña:\n\n" + activationLink
                + "\n\nEste enlace expira en 24 horas.";

        notifierFactory.create(NotificationType.EMAIL)
                .send(user.getEmail(), "Activa tu cuenta en EduPlanner", message);
    }
}