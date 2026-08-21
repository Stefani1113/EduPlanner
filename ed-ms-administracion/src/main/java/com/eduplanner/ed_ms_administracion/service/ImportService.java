package com.eduplanner.ed_ms_administracion.service;

import com.eduplanner.ed_lib_common.dto.GuardianDTO;
import com.eduplanner.ed_lib_common.dto.ImportErrorDetailDTO;
import com.eduplanner.ed_lib_common.dto.ImportReportDTO;
import com.eduplanner.ed_lib_common.dto.RegisterStudentDTO;
import com.eduplanner.ed_lib_common.entity.Import;
import com.eduplanner.ed_lib_common.entity.ImportError;
import com.eduplanner.ed_ms_administracion.repository.ImportErrorRepository;
import com.eduplanner.ed_ms_administracion.repository.ImportRepository;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final RegisterService registerService;
    private final ImportRepository importRepository;
    private final ImportErrorRepository importErrorRepository;

    /**
     * Orden de columnas esperado en el CSV 
     */
    private static final int COL_NOMBRE = 0;
    private static final int COL_APELLIDOS = 1;
    private static final int COL_CORREO = 2;
    private static final int COL_TELEFONO = 3;
    private static final int COL_DOCUMENTO = 4;
    private static final int COL_TIPO_DOCUMENTO = 5;
    private static final int COL_LUGAR_EXPEDICION = 6;
    private static final int COL_GENERO = 7;
    private static final int COL_FECHA_NACIMIENTO = 8;
    private static final int COL_DIRECCION = 9;
    private static final int COL_TIPO_SANGRE = 10;
    private static final int COL_DISCAPACIDADES = 11;
    private static final int COL_ESTRATO = 12;
    private static final int COL_TIPO_POBLACION = 13;
    private static final int COL_REGIMEN_SALUD = 14;
    private static final int COL_EPS = 15;
    private static final int COL_NOMBRE_ACUDIENTE = 16;
    private static final int COL_TELEFONO_ACUDIENTE = 17;

    private static final int EXPECTED_COLUMNS = 18;

    /**
     * Procesa el CSV completo: crea el registro Import, recorre fila por fila
     */
    public Integer importStudents(MultipartFile file) throws IOException, CsvException {

        /**
         * Crear el registro de importación 
         */
        Import importRecord = new Import();
        importRecord.setFileName(file.getOriginalFilename());
        importRecord.setImportDate(LocalDateTime.now());
        importRecord.setTotalRows(0);
        importRecord.setSuccessRows(0);
        importRecord.setFailedRows(0);
        importRepository.save(importRecord);

        int totalRows = 0;
        int successRows = 0;
        int failedRows = 0;

        // COnfiguración con excel en español 
        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.ISO_8859_1);
            CSVReader csvReader = new CSVReaderBuilder(reader)
                .withCSVParser(new CSVParserBuilder().withSeparator(';').build())
                .build()) {

    List<String[]> allRows = csvReader.readAll();

            // La primera fila son encabezados, se salta
            for (int i = 1; i < allRows.size(); i++) {
                String[] row = allRows.get(i);
                int rowNumber = i + 1;

                //Ignora filas completamente vacias
                if(isRowEmpty(row)) {
                    continue;
                }

                totalRows++;

                try {
                    validateRowLength(row);
                    RegisterStudentDTO dto = mapRowToDTO(row);
                    registerService.registerStudentInternal(dto, 
                        importRecord.getIdImport());

                        successRows++;

                } catch (Exception e) {
                    failedRows++;
                    
                    String friendlyMessage = getFriendlyErrorMessage(e, row);

                    saveImportError(
                        importRecord.getIdImport(), 
                        rowNumber,
                        row,
                        friendlyMessage);
                }
            }
        }

        /**
         * Actualizar los totales finales del Import
         */
        importRecord.setTotalRows(totalRows);
        importRecord.setSuccessRows(successRows);
        importRecord.setFailedRows(failedRows);
        importRepository.save(importRecord);

        return importRecord.getIdImport();
    }

    private void validateRowLength(String[] row) {
        if (row.length < EXPECTED_COLUMNS) {
            throw new IllegalArgumentException(
                    "La fila tiene " + row.length + " columnas, se esperaban " + EXPECTED_COLUMNS);
        }
    }

    private RegisterStudentDTO mapRowToDTO(String[] row) {
        RegisterStudentDTO dto = new RegisterStudentDTO();
        dto.setName(row[COL_NOMBRE].trim());
        dto.setSurnames(row[COL_APELLIDOS].trim());
        dto.setEmail(row[COL_CORREO].trim());
        dto.setPhoneNumber(row[COL_TELEFONO].trim());
        dto.setDocument(row[COL_DOCUMENTO].trim());
        dto.setDocumentType(row[COL_TIPO_DOCUMENTO].trim());
        dto.setDocumentIssuePlace(row[COL_LUGAR_EXPEDICION].trim());
        dto.setGender(row[COL_GENERO].trim());
        dto.setBirthdate(LocalDate.parse(row[COL_FECHA_NACIMIENTO].trim())); // AAAA-MM-DD
        dto.setAddress(row[COL_DIRECCION].trim());
        dto.setBloodType(row[COL_TIPO_SANGRE].trim());
        dto.setDisabilities(row[COL_DISCAPACIDADES].trim());
        dto.setStratum(Integer.parseInt(row[COL_ESTRATO].trim()));
        dto.setPopulationType(row[COL_TIPO_POBLACION].trim());
        dto.setHealthRegime(row[COL_REGIMEN_SALUD].trim());
        dto.setEps(row[COL_EPS].trim());

        GuardianDTO guardian = new GuardianDTO();
        guardian.setGuardianName(row[COL_NOMBRE_ACUDIENTE].trim());
        guardian.setGuardianPhone(row[COL_TELEFONO_ACUDIENTE].trim());
        dto.setGuardian(guardian);

        return dto;
    }

    /**
     * Metodo para guardar ImportError
     * @param idImport
     * @param rowNumber
     * @param row
     * @param errorMessage
     */
    private void saveImportError(Integer idImport, int rowNumber, String[] row, String errorMessage) {
        ImportError error = new ImportError();
        error.setIdImport(idImport);
        error.setRowNumber(rowNumber);
        error.setRowData(String.join(",", row));
        error.setError(errorMessage != null ? errorMessage : "Error desconocido al procesar la fila");
        importErrorRepository.save(error);
    }

    /**
     * Metodo para detectar filas vacias
     * @param row
     * @return
     */
    private boolean isRowEmpty(String[] row) {
        for(String value : row) {
            if(value != null && !value.trim().isEmpty()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Metodo para traducir errores
     * @param e
     * @param row
     * @return
     */
    private String getFriendlyErrorMessage(Exception e, String[] row) {
        if (e instanceof java.time.format.DateTimeParseException) {
            String dateValue = row[COL_FECHA_NACIMIENTO].trim();

            if(dateValue.isEmpty()) {
                return "La fecha de nacimiento es obligatoria.";
            }

            return "La fecha de nacimiento tiene un formato inválido."
            + "Utilice el formato AAAA-MM-DD";
        }

        if(e instanceof NumberFormatException) {
            String stratumValue = row[COL_ESTRATO].trim();

            if(stratumValue.isEmpty()) {
                return "El estrato es obligatorio";
            }

            return "EL estrato debe ser un número válido";
        }

        return e.getMessage() != null 
                    ? e.getMessage() : "Ocurrió un error desconocido al procesar la fila";
    }

    /**
     * Metodo para armar reporte
     */
    public ImportReportDTO getImportReport(Integer idImport) {
    Import importRecord = importRepository.findById(idImport)
            .orElseThrow(() -> new IllegalArgumentException("Importación no encontrada con id: " + idImport));

    ImportReportDTO report = new ImportReportDTO();
    report.setIdImport(importRecord.getIdImport());
    report.setFileName(importRecord.getFileName());
    report.setImportDate(importRecord.getImportDate());
    report.setTotalRows(importRecord.getTotalRows());
    report.setSuccessRows(importRecord.getSuccessRows());
    report.setFailedRows(importRecord.getFailedRows());

    List<ImportErrorDetailDTO> errors = importErrorRepository.findByIdImport(idImport).stream()
            .map(e -> {
                ImportErrorDetailDTO dto = new ImportErrorDetailDTO();
                dto.setRowNumber(e.getRowNumber());
                dto.setRowData(e.getRowData());
                dto.setError(e.getError());
                return dto;
            })
            .toList();
    report.setErrors(errors);

    return report;
}
}