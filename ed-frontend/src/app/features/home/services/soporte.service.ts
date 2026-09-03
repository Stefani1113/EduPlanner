import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}


export interface SupportRequestDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class SoporteService {

  private api = '/administracion/eduplanner/support';

  constructor(private http: HttpClient) {}

  enviarSoporte(
    dto: SupportRequestDTO
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.post<HttpGlobalResponse<void>>(
      this.api,
      dto
    );
  }
}
