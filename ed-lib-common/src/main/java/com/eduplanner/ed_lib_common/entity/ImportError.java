package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Import_Error")
public class ImportError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_error")
    private Integer idError;

    @Column(name = "id_import", nullable = false)
    private Integer idImport;

    @Column(name = "row_numbe", nullable = false)
    private Integer rowNumber;

    @Column(name = "row_data", columnDefinition = "TEXT")
    private String rowData;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String error;
}