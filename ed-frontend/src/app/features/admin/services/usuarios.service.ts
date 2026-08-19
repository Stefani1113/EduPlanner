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
  phoneNumber?: string;
  document: string;
  documentType: string;
  documentIssuePlace?: string;
  gender?: string;
  birthdate?: string | null;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  position: string;
  idRole: number;
}

export interface GuardianDTO {
  guardianName: string;
  guardianPhone: string;
}

export interface RegisterStudentDTO {
  name: string;
  surnames: string;
  email: string;
  phoneNumber?: string;
  document: string;
  documentType: string;
  documentIssuePlace?: string;
  gender?: string;
  birthdate: string | null;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  guardian: GuardianDTO;
}

export interface TeachingRequestDTO {
  name: string;
  surnames: string;
  email: string;
  password?: string;
  documentType: string;
  document: string;
  documentIssuePlace?: string;
  birthdate?: string | null;
  phoneNumber: string;
  photoUrl?: string;
  professionalDegrees?: string;
  qualificationsDesc?: string;
  gender?: string;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  position: string;
  idInstitution?: number;
}

export interface TeachingResponseDTO {
  idUser: number;
  name: string;
  surnames: string;
  email: string;
  documentType: string;
  document: string;
  phoneNumber: string;
  position: string;
  status: boolean;
  rol: string;
}

export interface UpdateRoleDTO {
  idRole: number;
  position?: string;
}

export const ID_ROL_ADMINISTRADOR = 1;
export const ID_ROL_DOCENTE = 2;
export const ID_ROL_ESTUDIANTE = 3;
export const ID_ROL_DIRECTIVO = 4;

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private api = 'http://localhost:8080/administracion/eduplanner';

  constructor(private http: HttpClient) {}

  listar(idRole?: number): Observable<HttpGlobalResponse<UserResponseDTO[]>> {
    const params: Record<string, string> = {};

    if (idRole !== undefined) {
      params['idRole'] = idRole.toString();
    }

    return this.http.get<HttpGlobalResponse<UserResponseDTO[]>>(
      `${this.api}/users`,
      { params }
    );
  }

  buscarPorNombre(name: string): Observable<HttpGlobalResponse<UserResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<UserResponseDTO[]>>(`${this.api}/users/search`, {
      params: { name }
    });
  }

  actualizarEstado(idUser: number, status: boolean): Observable<HttpGlobalResponse<void>> {
    return this.http.patch<HttpGlobalResponse<void>>(`${this.api}/users/${idUser}/status`, { status });
  }

  registrarPersonal(dto: RegisterStaffDTO): Observable<HttpGlobalResponse<void>> {
  console.log('DTO enviado:', dto);
  return this.http.post<HttpGlobalResponse<void>>(
    `${this.api}/users/register/staff`,
    dto
  );
}

  registrarDocente(dto: TeachingRequestDTO): Observable<HttpGlobalResponse<TeachingResponseDTO>> {
  return this.http.post<HttpGlobalResponse<TeachingResponseDTO>>(
    `${this.api}/teacher`,
    dto
  );
}

  registrarEstudiante(dto: RegisterStudentDTO): Observable<HttpGlobalResponse<void>> {
    return this.http.post<HttpGlobalResponse<void>>(`${this.api}/users/register/student`, dto);
  }

  actualizarRol(idUser: number, dto: UpdateRoleDTO): Observable<HttpGlobalResponse<void>> {
    return this.http.put<HttpGlobalResponse<void>>(`${this.api}/users/${idUser}/role`, dto);
  }
}