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

    /**
     * Obtiene el RolEnum correspondiente a un id dado
     */
    public static RolEnum fromId(int id) {
        for (RolEnum rol : values()) {
            if (rol.getId() == id) {
                return rol;
            }
        }
        throw new IllegalArgumentException("No existe un rol con id: " + id);
    }
}
