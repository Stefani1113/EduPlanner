package com.eduplanner.ed_ms_administracion.repository;

import com.eduplanner.ed_lib_common.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    boolean existsByDocument(String document);
    List<User> findByRoleIdRole(Integer idRole);
    List<User> findByNameContainingIgnoreCase(String name);
    boolean existsByPhoneNumber(String phoneNumber);
}
