package com.eduplanner.ed_ms_administracion.controller;

import com.eduplanner.ed_lib_common.dto.ApiResponseDTO;
import com.eduplanner.ed_lib_common.dto.DocenteRequestDTO;
import com.eduplanner.ed_lib_common.dto.DocenteResponseDTO;
import com.eduplanner.ed_ms_administracion.service.DocenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RF 5 / RF 5.1 / RF 5.2 / RF 5.3 / RF 5.4 - Gestión de perfiles de docentes.
 * Todos los endpoints requieren JWT válido (validado en JwtValidationFilter).
 * POST, PUT, DELETE → solo ADMINISTRADOR.
 * GET               → cualquier rol autenticado.
 *
 * Base: /eduplanner/docentes
 */
@RestController
@RequestMapping("/docentes")
@RequiredArgsConstructor
public class DocenteController {

    private final DocenteService docenteService;

    /**
     * RF 5 - Crear perfil de docente.
     * POST /eduplanner/docentes
     */
    @PostMapping
    public ResponseEntity<ApiResponseDTO<DocenteResponseDTO>> crear(
            @Valid @RequestBody DocenteRequestDTO request) {
        try {
            DocenteResponseDTO data = docenteService.crearDocente(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseDTO.ok("Docente creado correctamente", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponseDTO.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error("Error al crear el docente"));
        }
    }

    /**
     * RF 5.1 - Editar perfil de docente.
     * PUT /eduplanner/docentes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<DocenteResponseDTO>> editar(
            @PathVariable Integer id,
            @Valid @RequestBody DocenteRequestDTO request) {
        try {
            DocenteResponseDTO data = docenteService.editarDocente(id, request);
            return ResponseEntity.ok(ApiResponseDTO.ok("Docente actualizado correctamente", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponseDTO.error(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseDTO.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error("Error al actualizar el docente"));
        }
    }

    /**
     * RF 5.2 - Listar todos los docentes activos.
     * GET /eduplanner/docentes
     */
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<DocenteResponseDTO>>> listar() {
        try {
            List<DocenteResponseDTO> data = docenteService.listarDocentes();
            return ResponseEntity.ok(ApiResponseDTO.ok("Docentes obtenidos correctamente", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error("Error al obtener docentes"));
        }
    }

    /**
     * RF 5.2 - Ver perfil de un docente por id.
     * GET /eduplanner/docentes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<DocenteResponseDTO>> obtener(@PathVariable Integer id) {
        try {
            DocenteResponseDTO data = docenteService.obtenerDocente(id);
            return ResponseEntity.ok(ApiResponseDTO.ok("Docente encontrado", data));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * RF 5.3 - Eliminar (baja lógica) perfil de docente.
     * DELETE /eduplanner/docentes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> eliminar(@PathVariable Integer id) {
        try {
            docenteService.eliminarDocente(id);
            return ResponseEntity.ok(ApiResponseDTO.ok("Docente eliminado correctamente", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    /**
     * RF 5.4 - Buscar docentes por nombre, apellido, cargo o área profesional.
     * GET /eduplanner/docentes/buscar?q=matematicas
     */
 @GetMapping("/buscar")
public ResponseEntity<ApiResponseDTO<List<DocenteResponseDTO>>> buscar(
        @RequestParam String q) {
    try {
        List<DocenteResponseDTO> data = docenteService.buscarDocentes(q);
        if (data.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseDTO.error("No se encontraron docentes con el criterio: " + q));
        }
        return ResponseEntity.ok(ApiResponseDTO.ok("Búsqueda realizada correctamente", data));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDTO.error("Error al buscar docentes"));
    }
}

    /**
     * RF 5.4 - Filtrar docentes por cargo/posición.
     * GET /eduplanner/docentes/filtrar?cargo=matematicas
     */
    @GetMapping("/filtrar")
    public ResponseEntity<ApiResponseDTO<List<DocenteResponseDTO>>> filtrar(
            @RequestParam String cargo) {
        try {
            List<DocenteResponseDTO> data = docenteService.filtrarPorCargo(cargo);
            return ResponseEntity.ok(ApiResponseDTO.ok("Filtro aplicado correctamente", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error("Error al filtrar docentes"));
        }
    }
}
