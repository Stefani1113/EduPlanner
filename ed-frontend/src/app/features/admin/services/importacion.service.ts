import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpGlobalResponse<T> {
  data: T;
  message?: string;
}

export interface ImportData {
  idImport: number;
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

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {

  private readonly apiUrl = '/administracion/eduplanner';

  constructor(private http: HttpClient) {}

  importarEstudiantes(
    file: File
  ): Observable<HttpGlobalResponse<ImportData>> {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<HttpGlobalResponse<ImportData>>(
      `${this.apiUrl}/imports`,
      formData
    );
  }

  importarArchivo(
    file: File
  ): Observable<HttpGlobalResponse<ImportData>> {
    return this.importarEstudiantes(file);
  }

  obtenerReporte(
    idImport: number
  ): Observable<HttpGlobalResponse<ImportReport>> {

    return this.http.get<HttpGlobalResponse<ImportReport>>(
      `${this.apiUrl}/imports/${idImport}/report`
    );
  }
}