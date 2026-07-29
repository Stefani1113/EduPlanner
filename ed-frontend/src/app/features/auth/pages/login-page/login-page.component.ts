import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login(): void {

    this.authService.login(this.email, this.password).subscribe({

      next: (response: any) => {

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data));

        this.router.navigate(['/dashboard']); // Cambia la ruta si tu aplicación usa otra

      },

      error: (error) => {
        console.error(error);
        alert('Correo o contraseña incorrectos.');
      }

    });

  }

  irForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}