import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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
  idSchedule: number | null;
  idStudent: number;
  idCourse: number;
  attendanceDate: string;
  attendanceStatus: AttendanceStatus;
  observation?: string;
}

export interface AttendanceResponseDTO {
  idAttendance: number;
  idSchedule: number | null;
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

  private extraerLista<T>(respuesta: any): T[] {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (!respuesta) {
      return [];
    }

    if (Array.isArray(respuesta.content)) {
      return respuesta.content;
    }

    if (Array.isArray(respuesta.items)) {
      return respuesta.items;
    }

    if (Array.isArray(respuesta.results)) {
      return respuesta.results;
    }

    if (Array.isArray(respuesta.data)) {
      return respuesta.data;
    }

    if (respuesta.data) {
      if (Array.isArray(respuesta.data)) {
        return respuesta.data;
      }

      if (Array.isArray(respuesta.data.content)) {
        return respuesta.data.content;
      }

      if (Array.isArray(respuesta.data.items)) {
        return respuesta.data.items;
      }

      if (Array.isArray(respuesta.data.results)) {
        return respuesta.data.results;
      }
    }

    return [];
  }

  private extraerObjeto<T>(respuesta: any): T | null {
    if (!respuesta) {
      return null;
    }

    if (respuesta.data !== undefined) {
      return respuesta.data as T;
    }

    return respuesta as T;
  }

  private manejarError<T>(valorFallback: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      if (error.status === 404) {
        return of(valorFallback);
      }

      return throwError(() => error);
    };
  }

  listarCursos(): Observable<CourseResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(`${this.base}/courses`)
      .pipe(
        map(respuesta =>
          this.extraerLista<CourseResponseDTO>(respuesta)
        ),
        catchError(
          this.manejarError<CourseResponseDTO[]>([])
        )
      );
  }

  listarNiveles(): Observable<AcademicLevelResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(
        `${this.base}/academic-levels`
      )
      .pipe(
        map(respuesta =>
          this.extraerLista<AcademicLevelResponseDTO>(respuesta)
        ),
        catchError(
          this.manejarError<AcademicLevelResponseDTO[]>([])
        )
      );
  }

  listarDocentesAcademicos(): Observable<AcademicTeacherResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(
        `${this.base}/academic-teachers`
      )
      .pipe(
        map(respuesta =>
          this.extraerLista<AcademicTeacherResponseDTO>(respuesta)
        ),
        catchError(
          this.manejarError<AcademicTeacherResponseDTO[]>([])
        )
      );
  }

  listarEstudiantes(): Observable<UsuarioBasico[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(
        this.administracionUsers,
        {
          params: {
            idRole: this.ID_ROL_ESTUDIANTE
          }
        }
      )
      .pipe(
        map(respuesta =>
          this.extraerLista<UsuarioBasico>(respuesta)
        ),
        catchError(
          this.manejarError<UsuarioBasico[]>([])
        )
      );
  }

  listarEstudiantesPorCurso(
    idCourse: number
  ): Observable<UsuarioBasico[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(
        `${this.administracionUsers}/course/${idCourse}`
      )
      .pipe(
        map(respuesta =>
          this.extraerLista<UsuarioBasico>(respuesta)
        ),
        catchError(
          this.manejarError<UsuarioBasico[]>([])
        )
      );
  }

  listarDocentes(): Observable<UsuarioBasico[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(
        this.administracionTeachers
      )
      .pipe(
        map(respuesta =>
          this.extraerLista<UsuarioBasico>(respuesta)
        ),
        catchError(
          this.manejarError<UsuarioBasico[]>([])
        )
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
        map(respuesta => {
          const data =
            this.extraerObjeto<AttendanceResponseDTO>(
              respuesta
            );

          if (!data) {
            throw new Error(
              'El servidor no devolvió la asistencia registrada.'
            );
          }

          return data;
        })
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
        map(respuesta => {
          const data =
            this.extraerObjeto<AttendanceResponseDTO>(
              respuesta
            );

          if (!data) {
            throw new Error(
              'No se encontró el registro de asistencia.'
            );
          }

          return data;
        })
      );
  }

  obtenerHistorialPorCurso(
    idCourse: number,
    startDate: string,
    endDate: string
  ): Observable<AttendanceResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(
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
        map(respuesta =>
          this.extraerLista<AttendanceResponseDTO>(respuesta)
        ),
        catchError(
          this.manejarError<AttendanceResponseDTO[]>([])
        )
      );
  }

  obtenerHistorialPorEstudiante(
    idStudent: number,
    startDate: string,
    endDate: string
  ): Observable<AttendanceResponseDTO[]> {
    return this.http
      .get<HttpGlobalResponse<any>>(
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
        map(respuesta =>
          this.extraerLista<AttendanceResponseDTO>(respuesta)
        ),
        catchError(
          this.manejarError<AttendanceResponseDTO[]>([])
        )
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
        map(respuesta => {
          const data =
            this.extraerObjeto<AttendanceSummaryDTO>(
              respuesta
            );

          if (!data) {
            return {
              idStudent,
              startDate,
              endDate,
              totalRecords: 0,
              presentCount: 0,
              lateCount: 0,
              earlyDepartureCount: 0,
              justifiedAbsenceCount: 0,
              unjustifiedAbsenceCount: 0,
              attendancePercentage: 0
            };
          }

          return data;
        }),
        catchError(
          this.manejarError<AttendanceSummaryDTO>({
            idStudent,
            startDate,
            endDate,
            totalRecords: 0,
            presentCount: 0,
            lateCount: 0,
            earlyDepartureCount: 0,
            justifiedAbsenceCount: 0,
            unjustifiedAbsenceCount: 0,
            attendancePercentage: 0
          })
        )
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
        map(respuesta => {
          const data =
            this.extraerObjeto<AttendanceResponseDTO>(
              respuesta
            );

          if (!data) {
            throw new Error(
              'El servidor no devolvió la asistencia actualizada.'
            );
          }

          return data;
        })
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
        map(respuesta => {
          const data =
            this.extraerObjeto<AttendanceResponseDTO>(
              respuesta
            );

          if (!data) {
            throw new Error(
              'El servidor no devolvió la justificación.'
            );
          }

          return data;
        })
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
        map(respuesta => {
          const data =
            this.extraerObjeto<AttendanceResponseDTO>(
              respuesta
            );

          if (!data) {
            throw new Error(
              'El servidor no devolvió la revisión de la justificación.'
            );
          }

          return data;
        })
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
    const registrosValidos = Array.isArray(registros)
      ? registros
      : [];

    const totalRecords = registrosValidos.length;

    const presentCount = registrosValidos.filter(
      registro =>
        registro.attendanceStatus === 'PRESENT'
    ).length;

    const lateCount = registrosValidos.filter(
      registro =>
        registro.attendanceStatus === 'LATE'
    ).length;

    const earlyDepartureCount = registrosValidos.filter(
      registro =>
        registro.attendanceStatus === 'EARLY_DEPARTURE'
    ).length;

    const justifiedCount = registrosValidos.filter(
      registro =>
        registro.attendanceStatus === 'JUSTIFIED'
    ).length;

    const unjustifiedCount = registrosValidos.filter(
      registro =>
        registro.attendanceStatus === 'ABSENT'
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