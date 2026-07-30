import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {

  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    this.authService.login(this.email, this.password).subscribe({

      next: (response: any) => {

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data));

        this.router.navigate(['/dashboard']); // Cambia la ruta si es otra

      },

      error: (error) => {
        console.error(error);
        alert('Correo o contraseña incorrectos');
      }

    });

  }

}