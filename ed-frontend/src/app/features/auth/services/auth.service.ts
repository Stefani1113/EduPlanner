import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:8081/eduplanner/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, {
      email,
      password
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
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