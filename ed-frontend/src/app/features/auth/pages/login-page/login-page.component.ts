import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  email: string = '';
  password: string = '';

  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  showPassword: boolean = false;

  serverError: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {

    this.emailTouched = true;
    this.passwordTouched = true;
    this.serverError = '';

    if (!this.email || !this.password) {
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({

      next: (response: any) => {
        
        this.loading = false;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data));
        this.router.navigate(['/admin/dashboard']); // antes decía '/dashboard'
      },

      error: (error) => {

        this.loading = false;
        console.error(error);

        if (error.status === 401 || error.status === 403) {
          this.serverError = 'Correo o contraseña incorrectos.';
        } else if (error.status === 0) {
          this.serverError = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          this.serverError = 'Ocurrió un error. Intenta de nuevo más tarde.';
        }

      }

    });

  }

  irForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}
