package eduplanner.ed_ms_autenticacion.security;

import com.eduplanner.ed_lib_comun.enums.RolEnum;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;


@Target({ElementType.METHOD, ElementType.TYPE})

@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {

    RolEnum[] value();
}
