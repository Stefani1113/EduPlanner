import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password-page.html',
  styleUrls: ['./forgot-password-page.scss']
})
export class ForgotPasswordPageComponent {

  email: string = '';
  mensaje: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService) {}

  enviarEnlace(): void {

    this.mensaje = '';
    this.error = '';

    if (!this.email) {
      this.error = 'Ingresa tu correo.';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.email).subscribe({

      next: (response: any) => {
        this.loading = false;
        this.mensaje = response.message;
      },

      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.message ??
          'No fue posible enviar el correo.';
      }

    });

  }
}