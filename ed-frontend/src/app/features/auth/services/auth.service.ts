import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Debe ir por el gateway (8080) + ruta /autenticacion/** (StripPrefix=1)
  // → se reenvía a ed-ms-autenticacion (8081), cuyo context-path es /eduplanner
  // Coincide con los public-paths del gateway: /autenticacion/eduplanner/auth/*
  private api = 'http://localhost:8080/autenticacion/eduplanner/auth';

  constructor(private http: HttpClient) {}

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