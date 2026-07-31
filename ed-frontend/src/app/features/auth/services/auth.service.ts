import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/login-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:8081/eduplanner/auth';

  constructor(private http: HttpClient) {}

  models(data: LoginRequest): Observable<any> {
    return this.http.post(
      'http://localhost:8081/eduplanner/auth/login',
      data
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, {
      email,
      password
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.api}/forgot-password`, {
      email
    });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.api}/reset-password`, {
      token,
      newPassword
    });
  }

}