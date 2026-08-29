import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {

  private readonly api =
    '/administracion/eduplanner/users/import';

  private readonly TIMEOUT_MS = 60000;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el reporte de una importación realizada.
   */
  obtenerReporte(idImport: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${idImport}/report`);
  }

  /**
   * Envía el archivo Excel al backend para importar estudiantes.
   */
  importarExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      `${this.api}/students`,
      formData
    ).pipe(
      timeout(this.TIMEOUT_MS),

      catchError(err => {
        if (err?.name === 'TimeoutError') {
          return throwError(() => ({
            error: {
              message:
                'El servidor está tardando demasiado en responder. ' +
                'Verifica en unos minutos si los usuarios quedaron importados antes de reintentar.'
            }
          }));
        }

        return throwError(() => err);
      })
    );
  }
}