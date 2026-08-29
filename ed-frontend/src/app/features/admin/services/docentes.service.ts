import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export interface TeachingRequestDTO {
  name: string;
  surnames: string;
  email: string;
  password: string;
  documentType: string;
  document: string;
  documentIssuePlace?: string;
  birthdate: string;
  phoneNumber?: string;
  photoUrl?: string;
  professionalDegrees: string;
  qualificationsDesc?: string;
  gender: string;
  address?: string;
  bloodType: string;
  disabilities?: string;
  stratum: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  position: string;
  idInstitution: number;
}

export interface TeachingResponseDTO {
  idUser: number;
  name: string;
  surnames: string;
  email: string;
  documentType: string;
  document: string;
  documentIssuePlace: string | null;
  birthdate: string;
  phoneNumber: string | null;
  status: boolean;
  photoUrl: string | null;
  professionalDegrees: string;
  qualificationsDesc: string | null;
  gender: string;
  address: string | null;
  bloodType: string;
  disabilities: string | null;
  stratum: number;
  populationType: string | null;
  healthRegime: string | null;
  eps: string | null;
  position: string;
  creationDate: string;
  updateDate: string;
  idInstitution: number;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocentesService {

  private api = '/administracion/eduplanner/teacher';

  constructor(private http: HttpClient) {}

  listar(): Observable<HttpGlobalResponse<TeachingResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<TeachingResponseDTO[]>>(this.api);
  }

  obtenerPorId(
    id: number
  ): Observable<HttpGlobalResponse<TeachingResponseDTO>> {
    return this.http.get<HttpGlobalResponse<TeachingResponseDTO>>(
      `${this.api}/${id}`
    );
  }

  crear(
    dto: TeachingRequestDTO
  ): Observable<HttpGlobalResponse<TeachingResponseDTO>> {
    return this.http.post<HttpGlobalResponse<TeachingResponseDTO>>(
      this.api,
      dto
    );
  }

  actualizar(
    id: number,
    dto: TeachingRequestDTO
  ): Observable<HttpGlobalResponse<TeachingResponseDTO>> {
    return this.http.put<HttpGlobalResponse<TeachingResponseDTO>>(
      `${this.api}/${id}`,
      dto
    );
  }

  eliminar(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<HttpGlobalResponse<void>>(
      `${this.api}/${id}`
    );
  }

  buscar(
    q: string
  ): Observable<HttpGlobalResponse<TeachingResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<TeachingResponseDTO[]>>(
      `${this.api}/search`,
      {
        params: { q }
      }
    );
  }
}