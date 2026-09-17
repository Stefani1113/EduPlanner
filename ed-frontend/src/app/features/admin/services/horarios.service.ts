import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MensajeIA {
  tipo: 'ia' | 'usuario';
  texto: string;
}

export interface RespuestaIA {
  success: boolean;
  response: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(
    private http: HttpClient
  ) {}

  obtenerMensajeInicial(): MensajeIA[] {
    return [
      {
        tipo: 'ia',
        texto: '¡Hola! Soy EduPlanner IA. Estoy aquí para ayudarte con la organización y consulta de los horarios.'
      }
    ];
  }

  enviarMensaje(mensaje: string): Observable<RespuestaIA> {
    return this.http.post<RespuestaIA>(
      `${this.apiUrl}/chat`,
      {
        message: mensaje
      }
    );
  }
}