import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportData {
  idImport: number;
  message?: string;
  status?: string;
}

export interface ImportResponse {
  data: ImportData;
  message?: string;
  status?: string;
}

export interface ImportReport {
  data?: ImportReport;
  idImport?: number;
  totalRows?: number;
  successRows?: number;
  failedRows?: number;
  total?: number;
  successful?: number;
  failed?: number;
  message?: string;
  status?: string;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {

  private readonly apiUrl = '/administracion/eduplanner';

  constructor(private http: HttpClient) {}

  importarEstudiantes(file: File): Observable<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ImportResponse>(
      `${this.apiUrl}/imports`,
      formData
    );
  }

  importarArchivo(file: File): Observable<ImportResponse> {
    return this.importarEstudiantes(file);
  }

  obtenerReporte(idImport: number): Observable<ImportReport> {
    return this.http.get<ImportReport>(
      `${this.apiUrl}/imports/${idImport}/report`
    );
  }
}