package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class AssignCourseDTO {
    /**
     * El id del curso a asignar. Si viene null, el estudiante queda sin curso.
     */
    private Integer idCourse;
}