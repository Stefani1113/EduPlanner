package com.eduplanner.ed_ms_administracion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduplanner.ed_lib_common.entity.ImportError;
import java.util.List;


public interface ImportErrorRepository extends JpaRepository<ImportError, Integer> {
    List<ImportError> findByIdImport(Integer idImport);
    
}
