import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export interface AcademicLevelResponseDTO {
  idLevel: number;
  name: string;
  description?: string;
  status: boolean;
}

export interface CourseResponseDTO {
  idCourse: number;
  idPeriod: number;
  idLevel: number;
  idShift: number;
  homeroomTeacher: number | null;
  name: string;
  studentCount?: number;
  status: boolean;
}

export interface AcademicPeriodResponseDTO {
  idPeriod: number;
  name: string;
  startDate: string;
  endDate: string;
  status: boolean;
}

export interface SubjectResponseDTO {
  idSubject: number;
  name: string;
  description?: string;
  color?: string;
  status: boolean;
}

export interface AcademicLoadResponseDTO {
  idAcademicLoad: number;
  idTeacher: number;
  idCourse: number;
  idSubject: number;
  weeklyHours: number;
  priority: number;
  status: boolean;
}

export interface UsuarioBasico {
  idUser: number;
  name: string;
  surnames: string;
  status?: boolean;
  idRole?: number;
  roleName?: string;
  idCourse?: number;
}

export interface GradingScaleRequestDTO {
  minimumValue: number;
  maximumValue: number;
  minimumPassGrade: number;
}

export interface GradingScaleResponseDTO {
  idScale: number;
  minimumValue: number;
  maximumValue: number;
  minimumPassGrade: number;
}

export interface EvaluationTypeRequestDTO {
  idScale: number;
  numericGrade?: number | null;
  letterGrade?: string | null;
}

export interface EvaluationTypeResponseDTO {
  idEvaluationType: number;
  idScale: number;
  numericGrade?: number | null;
  letterGrade?: string | null;
}

export interface EvaluativeActivityRequestDTO {
  idPeriod: number;
  startDate: string;
  endDate: string;
  evaluationName: string;
  weightPercentage: number;
}

export interface EvaluativeActivityResponseDTO {
  idEvaluative: number;
  idPeriod: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  evaluationName: string;
  weightPercentage: number;
}

export interface GradeRequestDTO {
  idStudent: number;
  idCourse: number;
  idTeacher: number;
  idPeriod: number;
  idSubject: number;
  idEvaluative: number;
  idEvaluationType: number;
  gradeValue: number;
}

export interface GradeDetailResponseDTO {
  idGrade: number;
  idStudent: number;
  studentName: string;
  idTeacher: number;
  teacherName: string;
  idCourse: number;
  courseName: string;
  idSubject: number;
  subjectName: string;
  idPeriod: number;
  periodName: string;
  idEvaluative: number;
  evaluativeActivityName?: string;
  idEvaluationType: number;
  evaluationTypeName?: string;
  gradeValue: number;
  status: string;
  registrationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotasService {
  private readonly baseAcademica = '/gestion-academica/eduplanner';
  private readonly baseAdministracion = '/administracion/eduplanner';
  private readonly baseNotas = '/notas/eduplanner';

  constructor(private http: HttpClient) {}

  listarNiveles(): Observable<AcademicLevelResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<AcademicLevelResponseDTO[]>>(
        `${this.baseAcademica}/academic-levels`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarCursos(): Observable<CourseResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<CourseResponseDTO[]>>(
        `${this.baseAcademica}/courses`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarCursosPorNivel(
    idLevel: number
  ): Observable<CourseResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<CourseResponseDTO[]>>(
        `${this.baseAcademica}/courses/filter`,
        {
          params: {
            level: idLevel
          }
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarPeriodos(
    soloActivos = false
  ): Observable<AcademicPeriodResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<AcademicPeriodResponseDTO[]>>(
        `${this.baseAcademica}/academic-periods`,
        {
          params: soloActivos ? { active: true } : {}
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarAsignaturas(): Observable<SubjectResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<SubjectResponseDTO[]>>(
        `${this.baseAcademica}/subjects`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarCargaPorCurso(
    idCourse: number
  ): Observable<AcademicLoadResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<AcademicLoadResponseDTO[]>>(
        `${this.baseAcademica}/academic-loads/filter`,
        {
          params: {
            course: idCourse
          }
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarEstudiantesPorCurso(
    idCourse: number
  ): Observable<UsuarioBasico[]> {
    return this.http
      .get<HttpGlobalResponse<UsuarioBasico[]>>(
        `${this.baseAdministracion}/users/course/${idCourse}`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarDocentes(): Observable<UsuarioBasico[]> {
    return this.http
      .get<HttpGlobalResponse<UsuarioBasico[]>>(
        `${this.baseAdministracion}/teacher`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarEscalas(): Observable<GradingScaleResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<GradingScaleResponseDTO[]>>(
        `${this.baseNotas}/grading-scales`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  registrarEscala(
    dto: GradingScaleRequestDTO
  ): Observable<GradingScaleResponseDTO> {
    return this.http
      .post<HttpGlobalResponse<GradingScaleResponseDTO>>(
        `${this.baseNotas}/grading-scales`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  actualizarEscala(
    idScale: number,
    dto: GradingScaleRequestDTO
  ): Observable<GradingScaleResponseDTO> {
    return this.http
      .put<HttpGlobalResponse<GradingScaleResponseDTO>>(
        `${this.baseNotas}/grading-scales/${idScale}`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  listarTiposEvaluacion(): Observable<EvaluationTypeResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<EvaluationTypeResponseDTO[]>>(
        `${this.baseNotas}/evaluation-types`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  registrarTipoEvaluacion(
    dto: EvaluationTypeRequestDTO
  ): Observable<EvaluationTypeResponseDTO> {
    return this.http
      .post<HttpGlobalResponse<EvaluationTypeResponseDTO>>(
        `${this.baseNotas}/evaluation-types`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  listarActividadesEvaluativas(): Observable<
    EvaluativeActivityResponseDTO[]
  > {
    return this.http
      .get<HttpGlobalResponse<EvaluativeActivityResponseDTO[]>>(
        `${this.baseNotas}/evaluative-activities`
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  registrarActividadEvaluativa(
    dto: EvaluativeActivityRequestDTO
  ): Observable<EvaluativeActivityResponseDTO> {
    return this.http
      .post<HttpGlobalResponse<EvaluativeActivityResponseDTO>>(
        `${this.baseNotas}/evaluative-activities`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  registrarNota(
    dto: GradeRequestDTO
  ): Observable<GradeDetailResponseDTO> {
    return this.http
      .post<HttpGlobalResponse<GradeDetailResponseDTO>>(
        `${this.baseNotas}/grades`,
        dto
      )
      .pipe(
        map(r => r.data),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  actualizarNota(
    idGrade: number,
    dto: GradeRequestDTO
  ): Observable<GradeDetailResponseDTO> {
    return this.http
      .put<HttpGlobalResponse<GradeDetailResponseDTO>>(
        `${this.baseNotas}/grades/${idGrade}`,
        dto
      )
      .pipe(
        map(r => r.data),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  obtenerNotasPorEstudiante(
    idStudent: number,
    idPeriod: number
  ): Observable<GradeDetailResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<GradeDetailResponseDTO[]>>(
        `${this.baseNotas}/grades/by-student`,
        {
          params: {
            student: idStudent,
            period: idPeriod
          }
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  obtenerNotasPorCurso(
    idCourse: number,
    idSubject: number,
    idPeriod: number
  ): Observable<GradeDetailResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<GradeDetailResponseDTO[]>>(
        `${this.baseNotas}/grades/by-course`,
        {
          params: {
            course: idCourse,
            subject: idSubject,
            period: idPeriod
          }
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  descargarPdfEstudiante(
    idStudent: number,
    idPeriod: number
  ): Observable<Blob> {
    return this.http.get(
      `${this.baseNotas}/grades/pdf`,
      {
        params: {
          student: idStudent,
          period: idPeriod
        },
        responseType: 'blob'
      }
    );
  }

  descargarPdfCurso(
    idCourse: number,
    idSubject: number,
    idPeriod: number
  ): Observable<Blob> {
    return this.http.get(
      `${this.baseNotas}/grades/pdf`,
      {
        params: {
          course: idCourse,
          subject: idSubject,
          period: idPeriod
        },
        responseType: 'blob'
      }
    );
  }
}