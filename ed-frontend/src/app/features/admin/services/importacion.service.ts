import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {

  private api = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  importarExcel(file: File): Observable<any> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post(
      `${this.api}/import`,
      formData
    );

  }

}