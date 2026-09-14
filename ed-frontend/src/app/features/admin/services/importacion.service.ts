import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export interface HttpImportResponse<T> {
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {

  private readonly api = '/administracion/eduplanner/users/import';
  private readonly TIMEOUT_MS = 60000;

  constructor(private http: HttpClient) {}

  importarEstudiantes(file: File): Observable<HttpImportResponse<number>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<HttpImportResponse<number>>(
      `${this.api}/students`,
      formData
    ).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => {
        if (err?.name === 'TimeoutError') {
          return throwError(() => ({
            error: {
              message: 'El servidor está tardando demasiado en responder. Verifica el reporte antes de volver a importar el mismo archivo.'
            }
          }));
        }

        return throwError(() => err);
      })
    );
  }

  obtenerReporte(idImport: number): Observable<HttpImportResponse<ImportReport>> {
    return this.http.get<HttpImportResponse<ImportReport>>(
      `${this.api}/${idImport}/report`
    );
  }
}

export interface ImportErrorDetail {
  rowNumber: number;
  rowData: string;
  error: string;
}

export interface ImportReport {
  idImport: number;
  fileName: string;
  importDate: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ImportErrorDetail[];
}
