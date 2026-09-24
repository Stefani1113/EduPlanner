import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent implements OnInit {

  nuevaPassword: string = '';
  confirmarPassword: string = '';

  mostrarPassword: boolean = false;
  mostrarConfirmacion: boolean = false;

  fortaleza: string = '';
  porcentajeSeguridad: number = 0;

  tieneLongitud: boolean = false;
  tieneMayuscula: boolean = false;
  tieneMinuscula: boolean = false;
  tieneNumero: boolean = false;
  tieneEspecial: boolean = false;

  passwordValida: boolean = false;
  passwordsCoinciden: boolean = false;

  mensajeError: string = '';
  mensajeExito: string = '';

  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';

      if (!this.token) {
        this.mensajeError = 'El enlace para cambiar la contraseña no es válido o ha expirado.';
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

    if (this.tieneLongitud) puntos++;
    if (this.tieneMayuscula) puntos++;
    if (this.tieneMinuscula) puntos++;
    if (this.tieneNumero) puntos++;
    if (this.tieneEspecial) puntos++;

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
    if (this.nuevaPassword && this.confirmarPassword) {
      this.passwordsCoinciden = this.nuevaPassword === this.confirmarPassword;
    } else {
      this.passwordsCoinciden = false;
    }
  }

  actualizarPassword(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.token) {
      this.mensajeError = 'El enlace de recuperación no es válido o ha expirado.';
      return;
    }

    if (!this.passwordValida) {
      this.mensajeError = 'La contraseña no cumple con los requisitos de seguridad.';
      return;
    }

    if (!this.passwordsCoinciden) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService.resetPassword(this.token, this.nuevaPassword).subscribe({
    next: () => {
      this.mensajeExito = '¡Contraseña actualizada correctamente!';

      this.nuevaPassword = '';
      this.confirmarPassword = '';
      this.mostrarPassword = false;
      this.mostrarConfirmacion = false;
      this.fortaleza = '';
      this.porcentajeSeguridad = 0;
      this.passwordValida = false;
      this.passwordsCoinciden = false;

      setTimeout(() => {
        this.router.navigate(['/inicio']);
      }, 2000);
    },
    error: (error) => {
      console.error('Error al actualizar contraseña:', error);

        if (error.status === 400) {
          this.mensajeError = error.error?.message || 'El enlace de recuperación no es válido o ha expirado.';
        } else if (error.status === 404) {
          this.mensajeError = 'No se encontró la solicitud de recuperación.';
        } else {
          this.mensajeError = 'No se pudo actualizar la contraseña. Intenta nuevamente.';
        }
      }
    });
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }
}