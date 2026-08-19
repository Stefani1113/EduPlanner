package com.eduplanner.ed_ms_autenticacion.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.eduplanner.ed_lib_common.enums.RolEnum;


//Define donde se puede usar la anotación
@Target(ElementType.METHOD)
//RUNTIME: disponible en ejecución
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    RolEnum[] value();
}
 