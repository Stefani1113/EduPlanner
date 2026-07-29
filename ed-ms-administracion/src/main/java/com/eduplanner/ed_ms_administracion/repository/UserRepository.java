package com.eduplanner.ed_ms_administracion.repository;

import com.eduplanner.ed_lib_common.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    boolean existsByDocument(String document);
    List<User> findByRoleIdRole(Integer idRole);
    List<User> findByNameContainingIgnoreCase(String name);
    
  @Query("""
        SELECT u FROM User u
      WHERE u.role.idRole = 3
          AND u.status = true
          AND (
            LOWER(u.name)               LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(u.surnames)           LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(u.position)           LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(u.professionalDegrees) LIKE LOWER(CONCAT('%', :q, '%'))
          )
    """)
    List<User> searchDocentes(@Param("q") String query);

    /** RF 5.4 - Filtrar docentes activos por cargo/posición */
    @Query("SELECT u FROM User u WHERE u.role.idRole = 3 AND u.status = true AND LOWER(u.position) LIKE LOWER(CONCAT('%', :position, '%'))")
    List<User> findDocentesByPosition(@Param("position") String position);

}
