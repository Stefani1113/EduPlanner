import { Component } from '@angular/core';
import { ForgotPasswordFormComponent } from '../../components/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ForgotPasswordFormComponent],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss'
})
export class ForgotPasswordPageComponent {}