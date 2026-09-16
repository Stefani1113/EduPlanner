import { Injectable } from '@angular/core';

export interface MensajeIA {
  tipo: 'ia' | 'usuario';
  texto: string;
}

export interface RespuestaIA {
  texto: string;
  emocion: string;
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

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  /**
   * Mock de conflictos detectados en los horarios (cruces de docentes,
   * aulas duplicadas, etc). Cuando exista el endpoint real de validación
   * de horarios, reemplazar por la respuesta del backend.
   */
  private conflictos: ConflictoHorario[] = [
    {
      curso: '10-A',
      dia: 'Miércoles',
      hora: '8:00 am - 9:00 am',
      tipo: 'Cruce de docente',
      detalle: 'El docente de Matemáticas también está asignado en 11-B a la misma hora.',
      gravedad: 'alta'
    },
    {
      curso: '11-B',
      dia: 'Jueves',
      hora: '7:00 am - 8:00 am',
      tipo: 'Aula duplicada',
      detalle: 'El aula 204 está asignada a dos grupos de forma simultánea.',
      gravedad: 'media'
    },
    {
      curso: '10-A',
      dia: 'Viernes',
      hora: '11:00 am - 12:00 pm',
      tipo: 'Carga horaria excedida',
      detalle: 'El curso supera el máximo de horas semanales configurado para Ciencias.',
      gravedad: 'baja'
    }
  ];

  /**
   * Historial de notificaciones relacionadas con la publicación o
   * generación de horarios (manual o por IA). El más reciente queda
   * primero en la lista.
   */
  private notificaciones: NotificacionHorario[] = [
    {
      titulo: 'Horario 2° periodo publicado el 5 Marzo.',
      mensaje: 'Puedes revisar los Conflictos',
      fecha: '5 de marzo'
    }
  ];

  constructor() {}

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

  /**
   * Horario general que se muestra por defecto (vista de Administrador / Docente).
   * Cuando exista el endpoint real, este método debería reemplazarse por una
   * llamada HTTP al backend.
   */
  obtenerHorarioGeneral(): BloqueHorario[] {
    return [
      {
        hora: '6:00 am',
        horaFin: '7:00 am',
        lunes: 'Matemáticas',
        martes: 'Inglés',
        miercoles: 'Programación',
        jueves: 'Ciencias',
        viernes: 'Español',
        descanso: false
      },
      {
        hora: '7:00 am',
        horaFin: '8:00 am',
        lunes: 'Inglés',
        martes: 'Matemáticas',
        miercoles: 'Base de Datos',
        jueves: 'Programación',
        viernes: 'Sociales',
        descanso: false
      },
      {
        hora: '8:00 am',
        horaFin: '9:00 am',
        lunes: 'Programación',
        martes: 'Ciencias',
        miercoles: 'Matemáticas',
        jueves: 'Inglés',
        viernes: 'Educación Física',
        descanso: false
      },
      {
        hora: '9:00 am',
        horaFin: '10:00 am',
        lunes: 'Base de Datos',
        martes: 'Español',
        miercoles: 'Inglés',
        jueves: 'Matemáticas',
        viernes: 'Programación',
        descanso: false
      },
      {
        hora: '10:00 am',
        horaFin: '10:30 am',
        lunes: '',
        martes: '',
        miercoles: '',
        jueves: '',
        viernes: '',
        descanso: true
      },
      {
        hora: '11:00 am',
        horaFin: '12:00 pm',
        lunes: 'Ciencias',
        martes: 'Programación',
        miercoles: 'Sociales',
        jueves: 'Base de Datos',
        viernes: 'Matemáticas',
        descanso: false
      }
    ];
  }

  /**
   * Horarios de ejemplo organizados por curso/grado, para simular en frontend
   * lo que un estudiante debería ver según su curso. La clave se normaliza
   * en minúsculas y sin espacios (ej: "10-a", "11-b").
   *
   * Cuando exista el endpoint real (ej: GET /horarios/mi-curso), este mapa
   * debe eliminarse y reemplazarse por la respuesta del backend.
   */
  private horariosPorGrado: { [grado: string]: BloqueHorario[] } = {
    '10-a': [
      {
        hora: '6:00 am',
        horaFin: '7:00 am',
        lunes: 'Matemáticas',
        martes: 'Inglés',
        miercoles: 'Programación',
        jueves: 'Ciencias',
        viernes: 'Español',
        descanso: false
      },
      {
        hora: '7:00 am',
        horaFin: '8:00 am',
        lunes: 'Inglés',
        martes: 'Matemáticas',
        miercoles: 'Base de Datos',
        jueves: 'Programación',
        viernes: 'Sociales',
        descanso: false
      },
      {
        hora: '10:00 am',
        horaFin: '10:30 am',
        lunes: '',
        martes: '',
        miercoles: '',
        jueves: '',
        viernes: '',
        descanso: true
      },
      {
        hora: '11:00 am',
        horaFin: '12:00 pm',
        lunes: 'Ciencias',
        martes: 'Programación',
        miercoles: 'Sociales',
        jueves: 'Base de Datos',
        viernes: 'Matemáticas',
        descanso: false
      }
    ],
    '11-b': [
      {
        hora: '7:00 am',
        horaFin: '8:00 am',
        lunes: 'Cálculo',
        martes: 'Física',
        miercoles: 'Química',
        jueves: 'Inglés',
        viernes: 'Español',
        descanso: false
      },
      {
        hora: '8:00 am',
        horaFin: '9:00 am',
        lunes: 'Física',
        martes: 'Cálculo',
        miercoles: 'Inglés',
        jueves: 'Química',
        viernes: 'Educación Física',
        descanso: false
      }
    ]
  };

  /**
   * Devuelve el horario correspondiente a un grado/curso específico.
   * Si el grado no tiene horario registrado, devuelve un arreglo vacío
   * para que la vista pueda mostrar el estado "sin horario disponible".
   */
  obtenerHorarioPorGrado(grado: string | null | undefined): BloqueHorario[] {
    const clave = (grado || '').trim().toLowerCase();

    if (!clave || !this.horariosPorGrado[clave]) {
      return [];
    }

    return [...this.horariosPorGrado[clave]];
  }

  /**
   * Devuelve la lista de cursos que tienen horario registrado, para
   * alimentar el selector de curso en la vista de Administrador/Docente.
   * Cuando exista el endpoint real, reemplazar por la lista de cursos
   * de la institución.
   */
  obtenerCursosRegistrados(): string[] {
    return Object.keys(this.horariosPorGrado).map(clave => clave.toUpperCase());
  }

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