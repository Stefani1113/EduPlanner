package com.eduplanner.ed_ms_autenticacion.repository;

import eduplanner.ed_ms_autenticacion.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByDocument(String document);
    List<User> findByIdRole(Integer idRole);
}
