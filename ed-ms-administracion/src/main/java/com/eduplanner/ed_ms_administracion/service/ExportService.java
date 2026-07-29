package com.eduplanner.ed_ms_administracion.service;

import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final UserRepository userRepository;

    private static final String[] HEADERS = {
            "id", "nombre", "apellidos", "correo", "telefono", "documento",
            "tipo_documento", "lugar_expedicion_documento", "genero", "fecha_nacimiento",
            "direccion", "tipo_sangre", "discapacidades", "estrato", "tipo_poblacion",
            "regimen_salud", "eps", "cargo", "titulos_profesionales", "descripcion_cualificaciones",
            "rol", "estado", "fecha_creacion", "fecha_actualizacion", "ultimo_acceso"
    };

    public byte[] exportUsersToCsv() throws IOException {
        List<User> users = userRepository.findAll();

        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();

        // BOM UTF-8: evita que Excel muestre mal las tildes/ñ al abrir el CSV
        byteStream.write(0xEF);
        byteStream.write(0xBB);
        byteStream.write(0xBF);

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(byteStream, StandardCharsets.UTF_8))) {
            writer.writeNext(HEADERS);

            for (User user : users) {
                writer.writeNext(mapUserToRow(user));
            }
        }

        return byteStream.toByteArray();
    }

    private String[] mapUserToRow(User user) {
        return new String[]{
                nullSafe(user.getIdUser()),
                nullSafe(user.getName()),
                nullSafe(user.getSurnames()),
                nullSafe(user.getEmail()),
                nullSafe(user.getPhoneNumber()),
                nullSafe(user.getDocument()),
                nullSafe(user.getDocumentType()),
                nullSafe(user.getDocumentIssuePlace()),
                nullSafe(user.getGender()),
                nullSafe(user.getBirthdate()),
                nullSafe(user.getAddress()),
                nullSafe(user.getBloodType()),
                nullSafe(user.getDisabilities()),
                nullSafe(user.getStratum()),
                nullSafe(user.getPopulationType()),
                nullSafe(user.getHealthRegime()),
                nullSafe(user.getEps()),
                nullSafe(user.getPosition()),
                nullSafe(user.getProfessionalDegrees()),
                nullSafe(user.getQualificationsDesc()),
                nullSafe(user.getRole() != null ? user.getRole().getName() : null),
                nullSafe(user.getStatus()),
                nullSafe(user.getCreationDate()),
                nullSafe(user.getUpdateDate()),
                nullSafe(user.getLastAccess())
        };
    }

    /**
     * Convierte cualquier valor a String, evitando "null" literal en el CSV
     * cuando el campo no aplica para ese rol (queda vacío en su lugar).
     */
    private String nullSafe(Object value) {
        return value != null ? value.toString() : "";
    }
}