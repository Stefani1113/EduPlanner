import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../../../core/services/modal.service';

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
    private router: Router,
    private modalService: ModalService
  ) {}

  login(): void {

    this.authService.login(this.email, this.password).subscribe({

      next: (response: any) => {

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data));
        this.authService.iniciarRenovacionAutomatica();

        this.router.navigate(['/dashboard']); 

      },

      error: (error) => {
        console.error(error);
        this.modalService.error('Correo o contraseña incorrectos');
      }

    });

  }

}