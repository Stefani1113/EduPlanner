package com.eduplanner.ed_ms_administracion.repository;

import com.eduplanner.ed_lib_common.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.eduplanner.ed_lib_common.entity.User;



public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    boolean existsByDocument(String document);
    List<User> findByRoleIdRole(Integer idRole);
    List<User> findByNameContainingIgnoreCase(String name);




    List<User> findByRoleIdRoleAndStatusTrue(Integer idRole);  
    List<User> findByRoleIdRoleAndStatusTrueAndNameContainingIgnoreCase(Integer idRole, String name);

    // RF 5.4 - buscar por apellido
    List<User> findByRoleIdRoleAndStatusTrueAndSurnamesContainingIgnoreCase(Integer idRole, String surnames);

    // RF 5.4 - buscar por cargo
    List<User> findByRoleIdRoleAndStatusTrueAndPositionContainingIgnoreCase(Integer idRole, String position);

    // RF 5.4 - buscar por títulos profesionales
    List<User> findByRoleIdRoleAndStatusTrueAndProfessionalDegreesContainingIgnoreCase(Integer idRole, String degrees);


    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumberAndIdUserNot(String phoneNumber, Integer idUser);
}
