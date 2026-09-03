import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

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

  private perfilCache$: Observable<HttpGlobalResponse<MiPerfilDTO>> | null = null;
  private perfilActual: MiPerfilDTO | null = null;

  constructor(private http: HttpClient) {}


  obtenerMiPerfil(forzar: boolean = false): Observable<HttpGlobalResponse<MiPerfilDTO>> {
    if (forzar || !this.perfilCache$) {
      this.perfilCache$ = this.http
        .get<HttpGlobalResponse<MiPerfilDTO>>(this.api)
        .pipe(
          tap(respuesta => (this.perfilActual = respuesta.data)),
          shareReplay(1)
        );
    }

    return this.perfilCache$;
  }

  get perfilEnCache(): MiPerfilDTO | null {
    return this.perfilActual;
  }

  actualizarFoto(archivo: File): Observable<HttpGlobalResponse<string>> {
    const formData = new FormData();
    formData.append('file', archivo, archivo.name);

    return this.http.post<HttpGlobalResponse<string>>(
      `${this.api}/photo`,
      formData
    );
  }

  limpiarCache(): void {
    this.perfilCache$ = null;
    this.perfilActual = null;
  }

  actualizarFotoEnCache(photoUrl: string): void {
    if (this.perfilActual) {
      this.perfilActual = { ...this.perfilActual, photoUrl };
    }
  }
}
