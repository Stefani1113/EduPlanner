import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  models(data: LoginRequest) {
  return this.http.post<any>(
    'http://localhost:8081/eduplanner/auth/login',
    data
  );
}

  private api = 'http://localhost:8081/eduplanner/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, {
      email,
      password
    });
  }
}