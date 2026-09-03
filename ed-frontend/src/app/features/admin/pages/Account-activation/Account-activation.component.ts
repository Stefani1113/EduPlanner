import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { SesionUsuarioService } from '../../../auth/services/sesion-usuario.service';

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
    private authService: AuthService,
    private sesionUsuarioService: SesionUsuarioService
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


    const password = this.nuevaPassword;


    this.authService.activarCuenta(
      this.token,
      password
    ).subscribe({

      next: (respuesta) => {

        console.log(
          '[ACTIVACION] Cuenta activada correctamente:',
          respuesta
        );


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


            if (!loginResponse?.data?.token) {

              console.error(
                '[ACTIVACION] El backend no devolvió un token de sesión.'
              );

              this.mensajeError =
                'La cuenta fue activada, pero no se pudo iniciar sesión automáticamente.';

              return;

            }

            localStorage.setItem(
              'token',
              loginResponse.data.token
            );

            this.sesionUsuarioService.establecerDesdeLogin(loginResponse.data);

            this.authService.iniciarRenovacionAutomatica();

            this.mensajeExito =
              '¡Tu cuenta ha sido activada correctamente! Iniciando sesión...';


            this.nuevaPassword = '';
            this.confirmarPassword = '';

            this.evaluarFortaleza();
            this.validarCoincidencia();


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


  private obtenerEmailDesdeToken(
    token: string
  ): string | null {

    try {

      const partes = token.split('.');


      if (partes.length !== 3) {

        console.error(
          '[ACTIVACION] El token no tiene formato JWT válido.'
        );

        return null;

      }

      const payloadBase64 = partes[1];


      const base64 = payloadBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/');

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
