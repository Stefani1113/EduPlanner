package com.eduplanner.ed_ms_administracion.controller;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.ImportReportDTO;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_ms_administracion.security.RequireRole;
import com.eduplanner.ed_ms_administracion.service.ImportService;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/users/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    /**
     * Recibe el CSV de estudiantes y lo procesa fila por fila.
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping("/students")
    public ResponseEntity<HttpGlobalResponse<Integer>> importStudents(
            @RequestParam("file") MultipartFile file) {

        HttpGlobalResponse<Integer> response = new HttpGlobalResponse<>();

        if (file.isEmpty()) {
            response.setMessage("El archivo está vacío");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            Integer idImport = importService.importStudents(file);
            response.setData(idImport);
            response.setMessage("Importación procesada. Consulta el reporte para ver el detalle.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException | CsvException e) {
            response.setMessage("No se pudo leer el archivo CSV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Consulta el reporte de una importación ya procesada:
     * totales y detalle de cada fila que falló.
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{idImport}/report")
    public ResponseEntity<HttpGlobalResponse<ImportReportDTO>> getImportReport(
            @PathVariable Integer idImport) {

        HttpGlobalResponse<ImportReportDTO> response = new HttpGlobalResponse<>();

        try {
            ImportReportDTO report = importService.getImportReport(idImport);
            response.setData(report);
            response.setMessage("Reporte de importación consultado correctamente");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}