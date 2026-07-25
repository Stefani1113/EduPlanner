package com.eduplanner.ed_ms_administracion.repository;

import com.eduplanner.ed_lib_common.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    boolean existsByDocument(String document);
}
