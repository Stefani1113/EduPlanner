package com.eduplanner.ed_lib_comun.enums;

public enum RolEnum {
    ADMINISTRADOR(1),
    ESTUDIANTE(2),
    DOCENTE(3),
    SISTEMA(4);

    private final int id;

    RolEnum(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static RolEnum fromId(int id) {
        for (RolEnum r : values()) {
            if (r.id == id) return r;
        }
        throw new IllegalArgumentException("Rol no encontrado con id: " + id);
    }
}