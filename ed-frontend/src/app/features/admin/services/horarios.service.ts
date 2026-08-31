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

export interface CourseRequestDTO {
  idPeriod: number;
  idLevel: number;
  idShift: number;
  homeroomTeacher?: number | null;
  name: string;
  studentCount: number;
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

export interface AcademicPeriodRequestDTO {
  name: string;
  startDate: string;
  endDate: string;
}

export interface AcademicPeriodResponseDTO {
  idPeriod: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicLevelRequestDTO {
  name: string;
  description?: string;
}

export interface AcademicLevelResponseDTO {
  idLevel: number;
  name: string;
  description?: string | null;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolShiftRequestDTO {
  name: string;
  startTime: string;
  endTime: string;
}

export interface SchoolShiftResponseDTO {
  idShift: number;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlotRequestDTO {
  idShift: number;
  slotOrder: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

export interface TimeSlotResponseDTO {
  idTimeSlot: number;
  idShift: number;
  slotOrder: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherAvailabilityRequestDTO {
  idTeacher: number;
  idTimeSlot: number;
  dayOfWeek: number;
  available?: boolean;
}

export interface TeacherAvailabilityResponseDTO {
  idAvailability: number;
  idTeacher: number;
  idTimeSlot: number;
  dayOfWeek: number;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private readonly base =
    '/gestion-academica/eduplanner';

  constructor(private http: HttpClient) {}

  listarAsignaturas(): Observable<
    HttpGlobalResponse<SubjectResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<SubjectResponseDTO[]>
    >(
      `${this.base}/subjects`
    );
  }

  crearAsignatura(
    dto: SubjectRequestDTO
  ): Observable<
    HttpGlobalResponse<SubjectResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<SubjectResponseDTO>
    >(
      `${this.base}/subjects`,
      dto
    );
  }

  actualizarAsignatura(
    id: number,
    dto: SubjectRequestDTO
  ): Observable<
    HttpGlobalResponse<SubjectResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<SubjectResponseDTO>
    >(
      `${this.base}/subjects/${id}`,
      dto
    );
  }

  eliminarAsignatura(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/subjects/${id}`
    );
  }


  listarDocentesAcademicos(): Observable<
    HttpGlobalResponse<AcademicTeacherResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<AcademicTeacherResponseDTO[]>
    >(
      `${this.base}/academic-teachers`
    );
  }

  crearDocenteAcademico(
    dto: AcademicTeacherRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicTeacherResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<AcademicTeacherResponseDTO>
    >(
      `${this.base}/academic-teachers`,
      dto
    );
  }

  actualizarDocenteAcademico(
    id: number,
    dto: AcademicTeacherRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicTeacherResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<AcademicTeacherResponseDTO>
    >(
      `${this.base}/academic-teachers/${id}`,
      dto
    );
  }

  listarCargasAcademicas(): Observable<
    HttpGlobalResponse<AcademicLoadResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<AcademicLoadResponseDTO[]>
    >(
      `${this.base}/academic-loads`
    );
  }

  crearCargaAcademica(
    dto: AcademicLoadRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicLoadResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<AcademicLoadResponseDTO>
    >(
      `${this.base}/academic-loads`,
      dto
    );
  }

  actualizarCargaAcademica(
    id: number,
    dto: AcademicLoadRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicLoadResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<AcademicLoadResponseDTO>
    >(
      `${this.base}/academic-loads/${id}`,
      dto
    );
  }

  eliminarCargaAcademica(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/academic-loads/${id}`
    );
  }

  listarPeriodos(): Observable<
    HttpGlobalResponse<AcademicPeriodResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<AcademicPeriodResponseDTO[]>
    >(
      `${this.base}/academic-periods`
    );
  }

  crearPeriodo(
    dto: AcademicPeriodRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicPeriodResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<AcademicPeriodResponseDTO>
    >(
      `${this.base}/academic-periods`,
      dto
    );
  }

  actualizarPeriodo(
    id: number,
    dto: AcademicPeriodRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicPeriodResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<AcademicPeriodResponseDTO>
    >(
      `${this.base}/academic-periods/${id}`,
      dto
    );
  }

  eliminarPeriodo(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/academic-periods/${id}/permanent`
    );
  }

  listarNiveles(): Observable<
    HttpGlobalResponse<AcademicLevelResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<AcademicLevelResponseDTO[]>
    >(
      `${this.base}/academic-levels`
    );
  }

  crearNivel(
    dto: AcademicLevelRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicLevelResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<AcademicLevelResponseDTO>
    >(
      `${this.base}/academic-levels`,
      dto
    );
  }

  actualizarNivel(
    id: number,
    dto: AcademicLevelRequestDTO
  ): Observable<
    HttpGlobalResponse<AcademicLevelResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<AcademicLevelResponseDTO>
    >(
      `${this.base}/academic-levels/${id}`,
      dto
    );
  }

  eliminarNivel(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/academic-levels/${id}/permanent`
    );
  }

  listarJornadas(): Observable<
    HttpGlobalResponse<SchoolShiftResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<SchoolShiftResponseDTO[]>
    >(
      `${this.base}/school-shifts`
    );
  }

  crearJornada(
    dto: SchoolShiftRequestDTO
  ): Observable<
    HttpGlobalResponse<SchoolShiftResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<SchoolShiftResponseDTO>
    >(
      `${this.base}/school-shifts`,
      dto
    );
  }

  actualizarJornada(
    id: number,
    dto: SchoolShiftRequestDTO
  ): Observable<
    HttpGlobalResponse<SchoolShiftResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<SchoolShiftResponseDTO>
    >(
      `${this.base}/school-shifts/${id}`,
      dto
    );
  }

  eliminarJornada(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/school-shifts/${id}/permanent`
    );
  }

  listarFranjas(): Observable<
    HttpGlobalResponse<TimeSlotResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<TimeSlotResponseDTO[]>
    >(
      `${this.base}/time-slots`
    );
  }

  crearFranja(
    dto: TimeSlotRequestDTO
  ): Observable<
    HttpGlobalResponse<TimeSlotResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<TimeSlotResponseDTO>
    >(
      `${this.base}/time-slots`,
      dto
    );
  }

  actualizarFranja(
    id: number,
    dto: TimeSlotRequestDTO
  ): Observable<
    HttpGlobalResponse<TimeSlotResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<TimeSlotResponseDTO>
    >(
      `${this.base}/time-slots/${id}`,
      dto
    );
  }

  eliminarFranja(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/time-slots/${id}/permanent`
    );
  }

  listarDisponibilidad(): Observable<
    HttpGlobalResponse<TeacherAvailabilityResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<TeacherAvailabilityResponseDTO[]>
    >(
      `${this.base}/teacher-availability`
    );
  }

  crearDisponibilidad(
    dto: TeacherAvailabilityRequestDTO
  ): Observable<
    HttpGlobalResponse<TeacherAvailabilityResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<TeacherAvailabilityResponseDTO>
    >(
      `${this.base}/teacher-availability`,
      dto
    );
  }

  actualizarDisponibilidad(
    id: number,
    dto: TeacherAvailabilityRequestDTO
  ): Observable<
    HttpGlobalResponse<TeacherAvailabilityResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<TeacherAvailabilityResponseDTO>
    >(
      `${this.base}/teacher-availability/${id}`,
      dto
    );
  }

  eliminarDisponibilidad(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/teacher-availability/${id}`
    );
  }

  listarCursos(): Observable<
    HttpGlobalResponse<CourseResponseDTO[]>
  > {
    return this.http.get<
      HttpGlobalResponse<CourseResponseDTO[]>
    >(
      `${this.base}/courses`
    );
  }

  crearCurso(
    dto: CourseRequestDTO
  ): Observable<
    HttpGlobalResponse<CourseResponseDTO>
  > {
    return this.http.post<
      HttpGlobalResponse<CourseResponseDTO>
    >(
      `${this.base}/courses`,
      dto
    );
  }

  actualizarCurso(
    id: number,
    dto: CourseRequestDTO
  ): Observable<
    HttpGlobalResponse<CourseResponseDTO>
  > {
    return this.http.put<
      HttpGlobalResponse<CourseResponseDTO>
    >(
      `${this.base}/courses/${id}`,
      dto
    );
  }

  eliminarCurso(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<
      HttpGlobalResponse<void>
    >(
      `${this.base}/courses/${id}`
    );
  }
}