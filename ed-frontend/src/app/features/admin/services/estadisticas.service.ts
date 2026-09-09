import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';


interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export interface EstadisticasInstitucion {
  estudiantes: number;
  docentes: number;
  cursos: number;
}


const ID_ROL_ESTUDIANTE = 3;


@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  private apiUsuarios = '/administracion/eduplanner/users';
  private apiDocentes = '/administracion/eduplanner/teacher';
  private apiCursos = '/gestion-academica/eduplanner/courses';

  constructor(private http: HttpClient) {}

  obtenerEstadisticasInstitucion(): Observable<EstadisticasInstitucion> {

   
    const estudiantes$ = this.http
      .get<HttpGlobalResponse<unknown[]>>(this.apiUsuarios, {
        params: { idRole: ID_ROL_ESTUDIANTE }
      })
      .pipe(catchError(() => of({ data: [] as unknown[], message: '' })));

    const docentes$ = this.http
      .get<HttpGlobalResponse<unknown[]>>(this.apiDocentes)
      .pipe(catchError(() => of({ data: [] as unknown[], message: '' })));

    const cursos$ = this.http
      .get<HttpGlobalResponse<unknown[]>>(this.apiCursos)
      .pipe(catchError(() => of({ data: [] as unknown[], message: '' })));

    return forkJoin({
      estudiantes: estudiantes$,
      docentes: docentes$,
      cursos: cursos$
    }).pipe(
      map(({ estudiantes, docentes, cursos }) => ({
        estudiantes: (estudiantes.data ?? []).length,
        docentes: (docentes.data ?? []).length,
        cursos: (cursos.data ?? []).length
      }))
    );
  }
}