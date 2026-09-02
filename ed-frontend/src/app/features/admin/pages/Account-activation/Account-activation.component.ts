import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-account-activation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './Account-activation.component.html',
  styleUrls: ['./Account-activation.component.scss']
})
export class AccountActivationComponent implements OnInit {

  nuevaPassword = '';
  confirmarPassword = '';

  mostrarPassword = false;
  mostrarConfirmacion = false;

  token = '';

  mensajeError = '';
  mensajeExito = '';

  cargando = false;

  fortaleza = '';
  porcentajeSeguridad = 0;

  tieneLongitud = false;
  tieneMayuscula = false;
  tieneMinuscula = false;
  tieneNumero = false;
  tieneEspecial = false;

  passwordValida = false;
  passwordsCoinciden = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.token = params['token'] || '';

      if (!this.token) {
        this.mensajeError =
          'El enlace de activación no es válido o ha expirado.';
      }

    });

  }

  evaluarFortaleza(): void {

    const password = this.nuevaPassword;

    this.tieneLongitud = password.length >= 8;
    this.tieneMayuscula = /[A-Z]/.test(password);
    this.tieneMinuscula = /[a-z]/.test(password);
    this.tieneNumero = /[0-9]/.test(password);
    this.tieneEspecial = /[^A-Za-z0-9]/.test(password);

    let puntos = 0;

    if (this.tieneLongitud) {
      puntos++;
    }

    if (this.tieneMayuscula) {
      puntos++;
    }

    if (this.tieneMinuscula) {
      puntos++;
    }

    if (this.tieneNumero) {
      puntos++;
    }

    if (this.tieneEspecial) {
      puntos++;
    }

    if (password.length === 0) {

      this.fortaleza = '';
      this.porcentajeSeguridad = 0;
      this.passwordValida = false;

    } else if (puntos <= 1) {

      this.fortaleza = 'débil';
      this.porcentajeSeguridad = 25;
      this.passwordValida = false;

    } else if (puntos === 2) {

      this.fortaleza = 'media';
      this.porcentajeSeguridad = 50;
      this.passwordValida = false;

    } else if (puntos === 3 || puntos === 4) {

      this.fortaleza = 'fuerte';
      this.porcentajeSeguridad = 75;
      this.passwordValida = false;

    } else {

      this.fortaleza = 'excelente';
      this.porcentajeSeguridad = 100;
      this.passwordValida = true;

    }

    this.validarCoincidencia();

  }

  validarCoincidencia(): void {

    if (
      this.nuevaPassword &&
      this.confirmarPassword
    ) {

      this.passwordsCoinciden =
        this.nuevaPassword === this.confirmarPassword;

    } else {

      this.passwordsCoinciden = false;

    }

  }

  activarCuenta(): void {

    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.token) {

      this.mensajeError =
        'El enlace de activación no es válido o ha expirado.';

      return;

    }

    if (!this.passwordValida) {

      this.mensajeError =
        'La contraseña no cumple con los requisitos de seguridad.';

      return;

    }

    if (!this.passwordsCoinciden) {

      this.mensajeError =
        'Las contraseñas no coinciden.';

      return;

    }

    this.cargando = true;

    /*
     * Guardamos la contraseña antes de limpiar el formulario.
     * La necesitaremos para hacer el login automático.
     */
    const password = this.nuevaPassword;

    /*
     * 1. Activar la cuenta y cambiar la contraseña.
     */
    this.authService.activarCuenta(
      this.token,
      password
    ).subscribe({

      next: (respuesta) => {

        console.log(
          '[ACTIVACION] Cuenta activada correctamente:',
          respuesta
        );

        /*
         * 2. El endpoint de activación no devuelve JWT.
         *
         * El correo del usuario está almacenado como "sub"
         * dentro del JWT de activación.
         */
        const email =
          this.obtenerEmailDesdeToken(this.token);

        if (!email) {

          this.cargando = false;

          this.mensajeError =
            'La cuenta fue activada, pero no se pudo obtener el correo para iniciar sesión automáticamente.';

          return;

        }

        console.log(
          '[ACTIVACION] Correo obtenido del token:',
          email
        );

        /*
         * 3. Iniciar sesión automáticamente con
         * el correo y la nueva contraseña.
         */
        this.authService.login(
          email,
          password
        ).subscribe({

          next: (loginResponse: any) => {

            console.log(
              '[ACTIVACION] Login automático exitoso:',
              loginResponse
            );

            this.cargando = false;

            /*
             * Validamos que el backend realmente
             * haya enviado el JWT.
             */
            if (!loginResponse?.data?.token) {

              console.error(
                '[ACTIVACION] El backend no devolvió un token de sesión.'
              );

              this.mensajeError =
                'La cuenta fue activada, pero no se pudo iniciar sesión automáticamente.';

              return;

            }

            /*
             * 4. Guardar la sesión exactamente igual
             * que en LoginPageComponent.
             */
            localStorage.setItem(
              'token',
              loginResponse.data.token
            );

            localStorage.setItem(
              'usuario',
              JSON.stringify(loginResponse.data)
            );

            /*
             * 5. Activar la renovación automática
             * del JWT.
             */
            this.authService.iniciarRenovacionAutomatica();

            /*
             * 6. Mostrar mensaje de éxito.
             */
            this.mensajeExito =
              '¡Tu cuenta ha sido activada correctamente! Iniciando sesión...';

            /*
             * Limpiar los campos.
             */
            this.nuevaPassword = '';
            this.confirmarPassword = '';

            this.evaluarFortaleza();
            this.validarCoincidencia();

            /*
             * 7. Entrar directamente al sistema.
             */
            setTimeout(() => {

              this.router.navigate([
                '/admin/dashboard'
              ]);

            }, 1000);

          },

          error: (error) => {

            this.cargando = false;

            console.error(
              '[ACTIVACION] Error en login automático:',
              error
            );

            console.error(
              '[ACTIVACION] STATUS:',
              error.status
            );

            console.error(
              '[ACTIVACION] BODY:',
              error.error
            );

            /*
             * La activación ya se realizó.
             * El problema estaría solamente en el login.
             */
            this.mensajeError =
              error.error?.message ||
              error.error?.mensaje ||
              'La cuenta fue activada, pero no se pudo iniciar sesión automáticamente.';

          }

        });

      },

      error: (error) => {

        this.cargando = false;

        console.error(
          '[ACTIVACION] Error activando cuenta:',
          error
        );

        console.error(
          '[ACTIVACION] STATUS:',
          error.status
        );

        console.error(
          '[ACTIVACION] BODY:',
          error.error
        );

        this.mensajeError =
          error.error?.message ||
          error.error?.mensaje ||
          'No se pudo activar la cuenta. El enlace puede haber expirado.';

      }

    });

  }

  /**
   * Obtiene el correo electrónico desde el JWT
   * de activación.
   *
   * El backend genera el token colocando el correo
   * como subject ("sub").
   */
  private obtenerEmailDesdeToken(
    token: string
  ): string | null {

    try {

      const partes = token.split('.');

      /*
       * Un JWT válido tiene:
       * header.payload.signature
       */
      if (partes.length !== 3) {

        console.error(
          '[ACTIVACION] El token no tiene formato JWT válido.'
        );

        return null;

      }

      const payloadBase64 = partes[1];

      /*
       * Convertir Base64URL a Base64 normal.
       */
      const base64 = payloadBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      /*
       * Agregar padding si es necesario.
       */
      const padding =
        '='.repeat(
          (4 - (base64.length % 4)) % 4
        );

      const payloadJson = atob(
        base64 + padding
      );

      const payload = JSON.parse(
        payloadJson
      );

      console.log(
        '[ACTIVACION] Payload del token:',
        payload
      );

      /*
       * El backend utiliza el email como subject.
       */
      return payload?.sub || null;

    } catch (error) {

      console.error(
        '[ACTIVACION] No se pudo leer el correo del token:',
        error
      );

      return null;

    }

  }

}
