import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  constructor(private router: Router) {}

  irForgotPassword() {
    console.log('Se hizo clic');
    this.router.navigate(['/auth/forgot-password']);
  }
}