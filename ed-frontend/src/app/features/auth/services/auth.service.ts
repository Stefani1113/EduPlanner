import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/login-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

<<<<<<< HEAD
  private api = 'http://localhost:8082/eduplanner/auth';
=======
  private api = 'http://localhost:8081/eduplanner/auth';
>>>>>>> a1867f55135ccb8dfcc0639ddd8c32d277ddc44d

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

<<<<<<< HEAD
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
=======
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

>>>>>>> a1867f55135ccb8dfcc0639ddd8c32d277ddc44d
}