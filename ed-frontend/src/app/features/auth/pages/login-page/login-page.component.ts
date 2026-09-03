import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SesionUsuarioService } from '../../services/sesion-usuario.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  email: string = '';
  password: string = '';

  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  showPassword: boolean = false;

  serverError: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sesionUsuarioService: SesionUsuarioService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('sesionExpirada') === 'true') {
      this.serverError = '• Tu sesión expiró por inactividad. Inicia sesión de nuevo.';
    }
  }

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
        this.sesionUsuarioService.establecerDesdeLogin(response.data);
        this.authService.iniciarRenovacionAutomatica();

        this.router.navigate(['/admin/dashboard']);

      },

      error: (error) => {

        this.loading = false;

        console.log('STATUS:', error.status);
        console.log('ERROR COMPLETO:', error);
        console.log('BODY:', error.error);

        if (error.error?.message) {
          this.serverError = error.error.message;
        } else if (error.status === 401 || error.status === 403) {
          this.serverError = '• Correo o contraseña incorrectos.';
        } else if (error.status === 0) {
          this.serverError = '• No se pudo conectar con el servidor.';
        } else {
          this.serverError = '• Ocurrió un error.';
        }

      }

    });

  }

  irForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}