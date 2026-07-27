package com.eduplanner.ed_ms_administracion.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduplanner.ed_lib_common.entity.Guardian;

public interface GuardianRepository extends JpaRepository<Guardian, Integer>{
    Optional<Guardian> findByIdUser(Integer idUser);
}
