import { Injectable } from '@angular/core';

export interface MensajeIA {
  tipo: 'ia' | 'usuario';
  texto: string;
}

export interface RespuestaIA {
  texto: string;
  emocion: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  constructor() {}

  obtenerMensajeInicial(): MensajeIA[] {
    return [
      {
        tipo: 'ia',
        texto: '¡Hola! Soy EduPlanner IA. Estoy aquí para ayudarte con la organización y consulta de los horarios.'
      }
    ];
  }

  generarRespuesta(pregunta: string): RespuestaIA {
    const texto = pregunta.toLowerCase();

    if (
      texto.includes('conflicto') ||
      texto.includes('problema') ||
      texto.includes('cruce')
    ) {
      return {
        texto: 'He revisado la información disponible. En esta versión de demostración no se está consultando todavía el sistema real, pero puedo ayudarte a identificar posibles cruces de profesores, cursos y horas.',
        emocion: 'pensando'
      };
    }

    if (
      texto.includes('organizar') ||
      texto.includes('crear') ||
      texto.includes('horario')
    ) {
      return {
        texto: 'Claro. Para organizar un horario podemos tener en cuenta cursos, docentes, asignaturas y horas disponibles. Cuando conectemos la IA real, podré analizar esos datos automáticamente.',
        emocion: 'feliz'
      };
    }

    if (
      texto.includes('profesor') ||
      texto.includes('docente')
    ) {
      return {
        texto: 'Puedo ayudarte a revisar la disponibilidad de los docentes y detectar posibles cruces de horarios. Por ahora esta función funciona como una demostración del asistente.',
        emocion: 'normal'
      };
    }

    if (
      texto.includes('hola') ||
      texto.includes('buenas')
    ) {
      return {
        texto: '¡Hola! Me alegra verte. ¿Quieres que revisemos o organicemos un horario?',
        emocion: 'feliz'
      };
    }

    return {
      texto: 'Entiendo tu pregunta. Soy el asistente de horarios de EduPlanner. Actualmente estoy en modo demostración frontend, pero puedo simular la ayuda que posteriormente tendrá la IA.',
      emocion: 'normal'
    };
  }
}