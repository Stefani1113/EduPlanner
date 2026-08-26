import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export interface MiPerfilDTO {
  idUser: number;
  email: string;
  name: string;
  surnames: string;
  documentType: string;
  document: string;
  documentIssuePlace?: string;
  birthdate?: string | null;
  phoneNumber?: string;
  status: boolean;
  photoUrl: string | null;
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
  position?: string;
  roleName: string;
  idRole: number;
  idInstitution?: number;
  guardianName?: string;
  guardianPhone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private api = '/administracion/eduplanner/users/me';

  constructor(private http: HttpClient) {}

  /**
   * GET /users/me
   * Trae los datos del usuario actualmente logueado (según el token).
   */
  obtenerMiPerfil(): Observable<HttpGlobalResponse<MiPerfilDTO>> {
    return this.http.get<HttpGlobalResponse<MiPerfilDTO>>(this.api);
  }

  /**
   * POST /users/me/photo
   * Envía el archivo real (multipart/form-data), nunca Base64.
   */
  actualizarFoto(archivo: File): Observable<HttpGlobalResponse<string>> {
    const formData = new FormData();
    formData.append('file', archivo, archivo.name);

    return this.http.post<HttpGlobalResponse<string>>(
      `${this.api}/photo`,
      formData
    );
  }
}
