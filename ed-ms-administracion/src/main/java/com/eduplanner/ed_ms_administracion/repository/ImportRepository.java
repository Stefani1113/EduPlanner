package com.eduplanner.ed_ms_administracion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduplanner.ed_lib_common.entity.Import;

public interface ImportRepository extends JpaRepository<Import, Integer> {
    
}
