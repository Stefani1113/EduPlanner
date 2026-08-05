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

export interface GuardianDTO {
  guardianName: string;
  guardianPhone: string;
}

export interface RegisterStudentDTO {
  name: string;
  surnames: string;
  email: string;
  phoneNumber: string;
  document: string;
  documentType: string;
  birthdate: string | null;
  guardian: GuardianDTO;
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

  registrarDocente(dto: {
    name: string; surnames: string; email: string; phoneNumber: string;
    document: string; documentType: string; position: string; idRole: number;
  }): Observable<HttpGlobalResponse<void>> {
    return this.registrarPersonal(dto);
  }

  registrarEstudiante(dto: RegisterStudentDTO): Observable<HttpGlobalResponse<void>> {
    return this.http.post<HttpGlobalResponse<void>>(`${this.api}/users/register/student`, dto);
  }

  actualizarRol(idUser: number, dto: UpdateRoleDTO): Observable<HttpGlobalResponse<void>> {
    return this.http.put<HttpGlobalResponse<void>>(`${this.api}/users/${idUser}/role`, dto);
  }
}