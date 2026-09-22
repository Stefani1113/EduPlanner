import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MensajeIA {
  tipo: 'ia' | 'usuario';
  texto: string;
}

export interface BloqueHorario {
  hora: string;
  horaFin: string;
  minutosInicio: number;
  minutosFin: number;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
  descanso: boolean;
}

export type GravedadConflicto = 'alta' | 'media' | 'baja';

export interface ConflictoHorario {
  curso: string;
  dia: string;
  hora: string;
  tipo: string;
  detalle: string;
  gravedad: GravedadConflicto;
}

export interface NotificacionHorario {
  titulo: string;
  mensaje: string;
  fecha: string;
}

export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export interface CursoDTO {
  idCourse: number;
  idPeriod: number;
  idLevel: number;
  idShift: number;
  homeroomTeacher: number | null;
  name: string;
  studentCount: number;
  status: boolean;
}

export interface DocenteDTO {
  idUser: number;
  name: string;
  surnames: string;
}

export interface ScheduleResponseDTO {
  idSchedule: number;
  idCourse: number;
  idSubject: number;
  subjectName: string;
  idTeacher: number;
  teacherName: string;
  idTimeSlot: number;
  slotOrder: number;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export interface RespuestaChatIA {
  success: boolean;
  response?: string;
  error?: string;
  idGeneration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private apiGestionAcademica = '/gestion-academica/eduplanner';
  private apiAdministracion = '/administracion/eduplanner';
  private apiIa = '/ia/api';

  private conflictos: ConflictoHorario[] = [];
  private notificaciones: NotificacionHorario[] = [];

  constructor(private http: HttpClient) {}

  obtenerConflictos(): ConflictoHorario[] {
    return [...this.conflictos];
  }

  registrarConflicto(conflicto: ConflictoHorario): void {
    this.conflictos = [conflicto, ...this.conflictos];
  }

  obtenerNotificaciones(): NotificacionHorario[] {
    return [...this.notificaciones];
  }

  limpiarNotificaciones(): void {
    this.notificaciones = [];
  }

  registrarNotificacion(notificacion: NotificacionHorario): void {
    this.notificaciones = [
      notificacion,
      ...this.notificaciones
    ];
  }

  obtenerCursos(): Observable<HttpGlobalResponse<CursoDTO[]>> {
    return this.http.get<HttpGlobalResponse<CursoDTO[]>>(
      `${this.apiGestionAcademica}/courses`
    );
  }

  obtenerCursoPorId(
    idCourse: number
  ): Observable<HttpGlobalResponse<CursoDTO>> {
    return this.http.get<HttpGlobalResponse<CursoDTO>>(
      `${this.apiGestionAcademica}/courses/${idCourse}`
    );
  }

  obtenerDocentes(): Observable<HttpGlobalResponse<DocenteDTO[]>> {
    return this.http.get<HttpGlobalResponse<DocenteDTO[]>>(
      `${this.apiAdministracion}/users?idRole=2`
    );
  }

  obtenerMiHorario(): Observable<HttpGlobalResponse<ScheduleResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<ScheduleResponseDTO[]>>(
      `${this.apiGestionAcademica}/schedules/my-schedule`
    );
  }

  obtenerHorarioPorCurso(
    idCourse: number
  ): Observable<HttpGlobalResponse<ScheduleResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<ScheduleResponseDTO[]>>(
      `${this.apiGestionAcademica}/schedules/course/${idCourse}`
    );
  }

  obtenerHorarioPorDocente(
    idTeacher: number
  ): Observable<HttpGlobalResponse<ScheduleResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<ScheduleResponseDTO[]>>(
      `${this.apiGestionAcademica}/schedules/teacher/${idTeacher}`
    );
  }

  previsualizarGeneracion(
    idGeneration: number
  ): Observable<HttpGlobalResponse<ScheduleResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<ScheduleResponseDTO[]>>(
      `${this.apiGestionAcademica}/schedules/generations/${idGeneration}`
    );
  }

  publicarGeneracion(
    idGeneration: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.put<HttpGlobalResponse<void>>(
      `${this.apiGestionAcademica}/schedules/generations/${idGeneration}/publish`,
      {}
    );
  }

  eliminarGeneracion(
    idGeneration: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<HttpGlobalResponse<void>>(
      `${this.apiGestionAcademica}/schedules/generations/${idGeneration}`
    );
  }

  enviarMensajeIA(
    mensaje: string
  ): Observable<RespuestaChatIA> {
    return this.http.post<RespuestaChatIA>(
      `${this.apiIa}/chat`,
      {
        message: mensaje
      }
    );
  }

  obtenerMensajeInicial(): MensajeIA[] {
    return [
      {
        tipo: 'ia',
        texto:
          '¡Hola! Soy EduPlanner IA. Estoy aquí para ayudarte con la organización y consulta de los horarios.'
      }
    ];
  }
}