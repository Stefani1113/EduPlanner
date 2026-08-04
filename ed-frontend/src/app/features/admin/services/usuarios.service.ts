import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export interface UserResponseDTO {
  idUser: number;
  email: string;
  name: string;
  surnames: string;
  phoneNumber: string;
  status: boolean;
  photoUrl: string | null;
  roleName: string;
  idRole: number;
}

export interface RegisterStaffDTO {
  name: string;
  surnames: string;
  email: string;
  phoneNumber: string;
  document: string;
  documentType: string;
  position: string;
  idRole: number;
}

export interface RegisterStudentDTO {
  name: string;
  surnames: string;
  email: string;
  phoneNumber: string;
  document: string;
  documentType: string;
  birthdate: string | null;
}

export const ID_ROL_DOCENTE = 2;
export const ID_ROL_ESTUDIANTE = 3;

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

    private api = 'http://localhost:8080/administracion';
  constructor(private http: HttpClient) {}

  listar(idRole?: number): Observable<HttpGlobalResponse<UserResponseDTO[]>> {
    const params: Record<string, string> = {};
    if (idRole !== undefined) {
      params['idRole'] = idRole.toString();
    }
    return this.http.get<HttpGlobalResponse<UserResponseDTO[]>>(`${this.api}/users`, { params });
  }

  buscarPorNombre(name: string): Observable<HttpGlobalResponse<UserResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<UserResponseDTO[]>>(`${this.api}/users/search`, {
      params: { name }
    });
  }

  actualizarEstado(idUser: number, status: boolean): Observable<HttpGlobalResponse<void>> {
    return this.http.patch<HttpGlobalResponse<void>>(`${this.api}/users/${idUser}/status`, { status });
  }

  registrarDocente(dto: RegisterStaffDTO): Observable<HttpGlobalResponse<void>> {
    return this.http.post<HttpGlobalResponse<void>>(`${this.api}/users/register/staff`, dto);
  }

  registrarEstudiante(dto: RegisterStudentDTO): Observable<HttpGlobalResponse<void>> {
    return this.http.post<HttpGlobalResponse<void>>(`${this.api}/users/register/student`, dto);
  }
}