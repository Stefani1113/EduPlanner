import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {

  private api = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  importarArchivo(formData: FormData): Observable<any> {
    return this.http.post(`${this.api}/importar`, formData);
  }

}