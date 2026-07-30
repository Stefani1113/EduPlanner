import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';

import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { ForgotPasswordFormComponent } from './components/forgot-password-form/forgot-password-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule,

    LoginPageComponent,
    ForgotPasswordPageComponent,
    ResetPasswordPageComponent,
    ForgotPasswordFormComponent
  ]
})
export class AuthModule {}