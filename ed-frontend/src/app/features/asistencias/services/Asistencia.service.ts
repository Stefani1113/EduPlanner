import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EARLY_DEPARTURE'
  | 'JUSTIFIED';

export type JustificationStatus =
  | 'NONE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface AttendanceRequestDTO {
  idSchedule: number;
  idStudent: number;
  idCourse: number;
  attendanceDate: string;
  attendanceStatus: AttendanceStatus;
  observation?: string;
}

export interface AttendanceResponseDTO {
  idAttendance: number;
  idSchedule: number;
  idStudent: number;
  idCourse: number;
  attendanceDate: string;
  attendanceStatus: AttendanceStatus;
  observation?: string;
  justificationText?: string;
  justificationStatus?: JustificationStatus;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceSummaryDTO {
  idStudent: number;
  startDate: string;
  endDate: string;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  earlyDepartureCount: number;
  justifiedAbsenceCount: number;
  unjustifiedAbsenceCount: number;
  attendancePercentage: number;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicLevelResponseDTO {
  idLevel: number;
  name: string;
  description?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioBasico {
  idUser: number;
  name: string;
  surnames: string;
  status?: boolean;
  idRole?: number;
  roleName?: string;
}

export interface AcademicTeacherResponseDTO {
  idAcademicTeacher: number;
  idUser: number;
  maxDailyHours?: number;
  maxWeeklyHours?: number;
  status: boolean;
}

export interface JustificationRequestDTO {
  justificationText: string;
}

export interface JustificationReviewDTO {
  approved: boolean;
  reviewedBy: number;
}

export interface SesionResumen {
  idCourse: number;
  nombreCurso: string;
  docente: string;
  fecha: string;
  presentes: number;
  ausentes: number;
  tardanzas: number;
}

export interface ResumenCurso {
  idCourse: number;
  nombreCurso: string;
  nombreNivel: string;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  earlyDepartureCount: number;
  justifiedCount: number;
  unjustifiedCount: number;
  porcentajeAsistencia: number;
}

export interface FilaGridListado {
  idStudent: number;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  porFecha: Map<string, AttendanceResponseDTO | null>;
}

interface DescargarPdfParams {
  course?: number;
  student?: number;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  private readonly base = '/gestion-academica/eduplanner';

  private readonly administracionUsers =
    '/administracion/eduplanner/users';

  private readonly administracionTeachers =
    '/administracion/eduplanner/teacher';

  private readonly ID_ROL_ESTUDIANTE = 3;

  constructor(private http: HttpClient) {}


  listarCursos(): Observable<CourseResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<CourseResponseDTO[]>>(
        `${this.base}/courses`
      )
      .pipe(
        map(r => r.data ?? [])
      );
  }

  listarNiveles(): Observable<AcademicLevelResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<AcademicLevelResponseDTO[]>>(
        `${this.base}/academic-levels`
      )
      .pipe(
        map(r => r.data ?? [])
      );
  }

  listarDocentesAcademicos(): Observable<AcademicTeacherResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<AcademicTeacherResponseDTO[]>>(
        `${this.base}/academic-teachers`
      )
      .pipe(
        map(r => r.data ?? [])
      );
  }


  listarEstudiantes(): Observable<UsuarioBasico[]> {
    return this.http
      .get<HttpGlobalResponse<UsuarioBasico[]>>(
        this.administracionUsers,
        {
          params: {
            idRole: this.ID_ROL_ESTUDIANTE
          }
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  listarDocentes(): Observable<UsuarioBasico[]> {
    return this.http
      .get<HttpGlobalResponse<UsuarioBasico[]>>(
        this.administracionTeachers
      )
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }


  registrarAsistencia(
    dto: AttendanceRequestDTO
  ): Observable<AttendanceResponseDTO> {
    return this.http
      .post<HttpGlobalResponse<AttendanceResponseDTO>>(
        `${this.base}/attendance`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  obtenerAsistencia(
    idAttendance: number
  ): Observable<AttendanceResponseDTO> {
    return this.http
      .get<HttpGlobalResponse<AttendanceResponseDTO>>(
        `${this.base}/attendance/${idAttendance}`
      )
      .pipe(
        map(r => r.data)
      );
  }


  obtenerHistorialPorCurso(
    idCourse: number,
    startDate: string,
    endDate: string
  ): Observable<AttendanceResponseDTO[]> {

    return this.http
      .get<HttpGlobalResponse<AttendanceResponseDTO[]>>(
        `${this.base}/attendance/history`,
        {
          params: {
            course: idCourse,
            startDate,
            endDate
          }
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            return of([]);
          }

          throw err;
        })
      );
  }

  obtenerHistorialPorEstudiante(
    idStudent: number,
    startDate: string,
    endDate: string
  ): Observable<AttendanceResponseDTO[]> {

    return this.http
      .get<HttpGlobalResponse<AttendanceResponseDTO[]>>(
        `${this.base}/attendance/history`,
        {
          params: {
            student: idStudent,
            startDate,
            endDate
          }
        }
      )
      .pipe(
        map(r => r.data ?? []),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            return of([]);
          }

          throw err;
        })
      );
  }

  obtenerResumenPorEstudiante(
    idStudent: number,
    startDate: string,
    endDate: string
  ): Observable<AttendanceSummaryDTO> {

    return this.http
      .get<HttpGlobalResponse<AttendanceSummaryDTO>>(
        `${this.base}/attendance/summary`,
        {
          params: {
            student: idStudent,
            startDate,
            endDate
          }
        }
      )
      .pipe(
        map(r => r.data)
      );
  }

  actualizarAsistencia(
    idAttendance: number,
    dto: AttendanceRequestDTO
  ): Observable<AttendanceResponseDTO> {

    return this.http
      .put<HttpGlobalResponse<AttendanceResponseDTO>>(
        `${this.base}/attendance/${idAttendance}`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  enviarJustificacion(
    idAttendance: number,
    justificationText: string
  ): Observable<AttendanceResponseDTO> {

    const dto: JustificationRequestDTO = {
      justificationText
    };

    return this.http
      .patch<HttpGlobalResponse<AttendanceResponseDTO>>(
        `${this.base}/attendance/${idAttendance}/justification`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  revisarJustificacion(
    idAttendance: number,
    aprobar: boolean,
    reviewedBy: number
  ): Observable<AttendanceResponseDTO> {

    const dto: JustificationReviewDTO = {
      approved: aprobar,
      reviewedBy
    };

    return this.http
      .patch<HttpGlobalResponse<AttendanceResponseDTO>>(
        `${this.base}/attendance/${idAttendance}/justification/review`,
        dto
      )
      .pipe(
        map(r => r.data)
      );
  }

  descargarPdf(
    params: DescargarPdfParams
  ): Observable<Blob> {

    return this.http.get(
      `${this.base}/attendance/pdf`,
      {
        params: {
          ...params
        } as Record<string, string | number>,
        responseType: 'blob'
      }
    );
  }


  calcularResumen(
    registros: AttendanceResponseDTO[]
  ): Omit<
    ResumenCurso,
    'idCourse' | 'nombreCurso' | 'nombreNivel'
  > {

    const totalRecords = registros.length;

    const presentCount = registros.filter(
      r => r.attendanceStatus === 'PRESENT'
    ).length;

    const lateCount = registros.filter(
      r => r.attendanceStatus === 'LATE'
    ).length;

    const earlyDepartureCount = registros.filter(
      r => r.attendanceStatus === 'EARLY_DEPARTURE'
    ).length;

    const justifiedCount = registros.filter(
      r => r.attendanceStatus === 'JUSTIFIED'
    ).length;

    const unjustifiedCount = registros.filter(
      r => r.attendanceStatus === 'ABSENT'
    ).length;

    const asistieron =
      presentCount +
      justifiedCount +
      lateCount +
      earlyDepartureCount;

    const porcentajeAsistencia =
      totalRecords === 0
        ? 0
        : Math.round(
            (asistieron * 100 / totalRecords) * 100
          ) / 100;

    return {
      totalRecords,
      presentCount,
      lateCount,
      earlyDepartureCount,
      justifiedCount,
      unjustifiedCount,
      porcentajeAsistencia
    };
  }
}
