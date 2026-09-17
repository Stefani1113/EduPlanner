import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MensajeIA {
  tipo: 'ia' | 'usuario';
  texto: string;
}

export interface BloqueHorario {
  hora: string;
  horaFin: string;
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

export interface ClaseHorarioDTO {
  idSchedule: number;
  dayOfWeek: number;
  idTimeSlot: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  idCourse: number;
  courseName: string;
  subjectName: string;
  teacherName: string;
}

export interface RespuestaChatIA {
  success: boolean;
  response?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private apiGestionAcademica = '/gestion-academica/eduplanner';
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

  registrarNotificacion(notificacion: NotificacionHorario): void {
    this.notificaciones = [notificacion, ...this.notificaciones];
  }

  obtenerCursos(): Observable<HttpGlobalResponse<CursoDTO[]>> {
    return this.http.get<HttpGlobalResponse<CursoDTO[]>>(
      `${this.apiGestionAcademica}/courses`
    );
  }

  obtenerMiHorario(idCourse?: number | null): Observable<HttpGlobalResponse<ClaseHorarioDTO[]>> {
    let params = new HttpParams();

    if (idCourse !== null && idCourse !== undefined) {
      params = params.set('idCourse', idCourse);
    }

    return this.http.get<HttpGlobalResponse<ClaseHorarioDTO[]>>(
      `${this.apiGestionAcademica}/schedules/mi-horario`,
      { params }
    );
  }

  enviarMensajeIA(mensaje: string): Observable<RespuestaChatIA> {
    return this.http.post<RespuestaChatIA>(
      `${this.apiIa}/chat`,
      { message: mensaje }
    );
  }

  obtenerMensajeInicial(): MensajeIA[] {
    return [
      {
        tipo: 'ia',
        texto: '¡Hola! Soy EduPlanner IA. Estoy aquí para ayudarte con la organización y consulta de los horarios.'
      }
    ];
  }
}