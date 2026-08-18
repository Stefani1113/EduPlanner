import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {

  private api = 'http://localhost:8080/administracion/eduplanner/users/import';

  
  private readonly TIMEOUT_MS = 60000; 

  constructor(private http: HttpClient) {}

  importarExcel(file: File): Observable<any> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post(
      `${this.api}/students`,
      formData
    ).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => {
        if (err?.name === 'TimeoutError') {
          return throwError(() => ({
            error: {
              message: 'El servidor está tardando demasiado en responder (posiblemente enviando los correos de activación). Verifica en unos minutos si los usuarios quedaron importados antes de reintentar.'
            }
          }));
        }
        return throwError(() => err);
      })
    );

  }

}