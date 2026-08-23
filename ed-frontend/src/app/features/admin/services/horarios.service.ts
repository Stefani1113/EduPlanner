import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}


export interface SubjectRequestDTO {
  name: string;
  description?: string;
  color?: string;
}

export interface SubjectResponseDTO {
  idSubject: number;
  name: string;
  description: string | null;
  color: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface AcademicTeacherRequestDTO {
  idUser: number;
  maxDailyHours: number;
  maxWeeklyHours: number;
}

export interface AcademicTeacherResponseDTO {
  idAcademicTeacher: number;
  idUser: number;
  maxDailyHours: number;
  maxWeeklyHours: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface AcademicLoadRequestDTO {
  idTeacher: number;  
  idCourse: number;
  idSubject: number;
  weeklyHours: number;
  priority?: number;
}

export interface AcademicLoadResponseDTO {
  idAcademicLoad: number;
  idTeacher: number;
  idCourse: number;
  idSubject: number;
  weeklyHours: number;
  priority: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface CourseResponseDTO {
  idCourse: number;
  idPeriod: number;
  idLevel: number;
  idShift: number;
  homeroomTeacher: number | null;
  name: string;
  studentCount: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private base = 'http://localhost:8080/gestion-academica/eduplanner';

  constructor(private http: HttpClient) {}


  listarAsignaturas(): Observable<HttpGlobalResponse<SubjectResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<SubjectResponseDTO[]>>(`${this.base}/subjects`);
  }

  crearAsignatura(dto: SubjectRequestDTO): Observable<HttpGlobalResponse<SubjectResponseDTO>> {
    return this.http.post<HttpGlobalResponse<SubjectResponseDTO>>(`${this.base}/subjects`, dto);
  }

  actualizarAsignatura(id: number, dto: SubjectRequestDTO): Observable<HttpGlobalResponse<SubjectResponseDTO>> {
    return this.http.put<HttpGlobalResponse<SubjectResponseDTO>>(`${this.base}/subjects/${id}`, dto);
  }

  eliminarAsignatura(id: number): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<HttpGlobalResponse<void>>(`${this.base}/subjects/${id}`);
  }


  listarDocentesAcademicos(): Observable<HttpGlobalResponse<AcademicTeacherResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<AcademicTeacherResponseDTO[]>>(`${this.base}/academic-teachers`);
  }

  crearDocenteAcademico(dto: AcademicTeacherRequestDTO): Observable<HttpGlobalResponse<AcademicTeacherResponseDTO>> {
    return this.http.post<HttpGlobalResponse<AcademicTeacherResponseDTO>>(`${this.base}/academic-teachers`, dto);
  }

  actualizarDocenteAcademico(id: number, dto: AcademicTeacherRequestDTO): Observable<HttpGlobalResponse<AcademicTeacherResponseDTO>> {
    return this.http.put<HttpGlobalResponse<AcademicTeacherResponseDTO>>(`${this.base}/academic-teachers/${id}`, dto);
  }


  listarCargasAcademicas(): Observable<HttpGlobalResponse<AcademicLoadResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<AcademicLoadResponseDTO[]>>(`${this.base}/academic-loads`);
  }

  crearCargaAcademica(dto: AcademicLoadRequestDTO): Observable<HttpGlobalResponse<AcademicLoadResponseDTO>> {
    return this.http.post<HttpGlobalResponse<AcademicLoadResponseDTO>>(`${this.base}/academic-loads`, dto);
  }

  actualizarCargaAcademica(id: number, dto: AcademicLoadRequestDTO): Observable<HttpGlobalResponse<AcademicLoadResponseDTO>> {
    return this.http.put<HttpGlobalResponse<AcademicLoadResponseDTO>>(`${this.base}/academic-loads/${id}`, dto);
  }

  eliminarCargaAcademica(id: number): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<HttpGlobalResponse<void>>(`${this.base}/academic-loads/${id}`);
  }


  listarCursos(): Observable<HttpGlobalResponse<CourseResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<CourseResponseDTO[]>>(`${this.base}/courses`);
  }

}
