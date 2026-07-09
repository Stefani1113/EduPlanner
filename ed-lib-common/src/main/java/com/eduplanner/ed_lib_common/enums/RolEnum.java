package com.eduplanner.ed_lib_common.enums;

/**
 * Roles implementados en el sistema
 * RolEnum
 */

public enum RolEnum {
    ADMINISTRADOR(1),
    DOCENTE(2),
    ESTUDIANTE(3),
    DIRECTIVO(4);

    private final int id;

    RolEnum(int id){
        this.id = id;
    }

    public int getId(){
        return id;
    }
}
