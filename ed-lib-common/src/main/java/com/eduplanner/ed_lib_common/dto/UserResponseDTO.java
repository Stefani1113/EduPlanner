package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eduplanner.ed_lib_common.entity.User;

import lombok.Data;

@Data
public class UserResponseDTO {

    private Integer idUser;

    private String email;

    private String name;

    private String surnames;

    private String documentType;

    private String document;

    private String documentIssuePlace;

    private LocalDate birthdate;

    private String phoneNumber;

    private Boolean status;

    private String photoUrl;

    private String professionalDegrees;

    private String qualificationsDesc;

    private String gender;

    private String address;

    private String bloodType;

    private String disabilities;

    private Integer stratum;

    private String populationType;

    private String healthRegime;

    private String eps;

    private String position;

    private LocalDateTime creationDate;

    private LocalDateTime updateDate;

    private LocalDateTime lastAccess;

    private String roleName;

    private Integer idRole;

    private Integer idInstitution;

    /**
     * Metodo estático 
     */

    public static UserResponseDTO fromEntity(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setIdUser(user.getIdUser());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setSurnames(user.getSurnames());
        dto.setDocumentType(user.getDocumentType());
        dto.setDocument(user.getDocument());
        dto.setDocumentIssuePlace(user.getDocumentIssuePlace());
        dto.setBirthdate(user.getBirthdate());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStatus(user.getStatus());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setProfessionalDegrees(user.getProfessionalDegrees());
        dto.setQualificationsDesc(user.getQualificationsDesc());
        dto.setGender(user.getGender());
        dto.setAddress(user.getAddress());
        dto.setBloodType(user.getBloodType());
        dto.setDisabilities(user.getDisabilities());
        dto.setStratum(user.getStratum());
        dto.setPopulationType(user.getPopulationType());
        dto.setHealthRegime(user.getHealthRegime());
        dto.setEps(user.getEps());
        dto.setPosition(user.getPosition());
        dto.setCreationDate(user.getCreationDate());
        dto.setUpdateDate(user.getUpdateDate());
        dto.setLastAccess(user.getLastAccess());
        dto.setRoleName(user.getRole().getName());
        dto.setIdRole(user.getRole().getIdRole());
        return dto;
    }
}
