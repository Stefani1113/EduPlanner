package com.eduplanner.ed_lib_common.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data

/**
 * Tabla importación
 * Import
 */
@Table(name = "Import")
public class Import {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_import")
    private Integer idImport;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "import_date", nullable = false)
    private LocalDateTime importDate;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "success_rows", nullable = false)
    private Integer successRows;

    @Column(name = "failed_rows", nullable = false)
    private Integer failedRows;


    /**
     * Asignación del dia de la impotación automática
     */
    @PrePersist
    public void prePersist() {
        this.importDate = LocalDateTime.now();
    }
}
