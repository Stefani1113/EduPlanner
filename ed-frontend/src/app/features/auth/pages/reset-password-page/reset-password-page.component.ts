import { Component } from '@angular/core';
import { ResetPasswordFormComponent } from '../../components/reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ResetPasswordFormComponent],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss'
})
export class ResetPasswordPageComponent {}