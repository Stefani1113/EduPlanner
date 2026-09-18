import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, from } from 'rxjs';
import { catchError, map, concatMap, tap, delay } from 'rxjs/operators';

import {
  NotasService,
  AcademicLevelResponseDTO,
  CourseResponseDTO,
  AcademicPeriodResponseDTO,
  SubjectResponseDTO,
  AcademicLoadResponseDTO,
  UsuarioBasico,
  GradingScaleResponseDTO,
  EvaluationTypeResponseDTO,
  EvaluativeActivityResponseDTO,
  GradeDetailResponseDTO,
  GradeRequestDTO
} from '../services/notas.service';

type Tab = 'historial' | 'reportes' | 'notas' | 'calificacion';

interface ResumenAsignatura {
  idSubject: number;
  nombre: string;
  promedio: number;
  porcentaje: number;
  totalNotas: number;
}

interface FilaNotas {
  estudiante: UsuarioBasico;
  nombreCompleto: string;
}

interface CeldaEstado {
  valor: string;
  idGrade: number | null;
  guardando: boolean;
  error: string | null;
}

interface PasoPeriodo {
  idEvaluative: number | null;
  evaluationName: string;
  weightPercentage: number;
  existente: boolean;
}

interface ResumenReporteEstudiante {
  estudiante: UsuarioBasico;
  notas: GradeDetailResponseDTO[];
  promedio: number;
}

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notas.component.html',
  styleUrl: './notas.component.scss'
})
export class NotasComponent implements OnInit {

  tabActiva: Tab = 'historial';


  niveles: AcademicLevelResponseDTO[] = [];
  cursos: CourseResponseDTO[] = [];
  periodos: AcademicPeriodResponseDTO[] = [];
  asignaturas: SubjectResponseDTO[] = [];

  escalaActual: GradingScaleResponseDTO | null = null;
  tiposEvaluacion: EvaluationTypeResponseDTO[] = [];
  actividadesEvaluativas: EvaluativeActivityResponseDTO[] = [];

  cargandoBase = true;
  errorBase: string | null = null;

  idCursoSeleccionado: number | null = null;
  idPeriodoSeleccionado: number | null = null;


  cargandoHistorial = false;
  errorHistorial: string | null = null;
  historialConsultado = false;

  resumenAsignaturas: ResumenAsignatura[] = [];
  promedioGeneral = 0;


  idNivelReporte: number | null = null;
  idCursoReporte: number | null = null;
  idPeriodoReporte: number | null = null;

  cursosReporte: CourseResponseDTO[] = [];
  estudiantesReporte: UsuarioBasico[] = [];
  seleccionadosReporte = new Set<number>();

  cargandoEstudiantesReporte = false;
  cargandoVistaPrevia = false;
  errorReporte: string | null = null;

  vistaPrevia: ResumenReporteEstudiante[] = [];
  vistaPreviaGenerada = false;

  descargandoPdf = false;
  descargandoPdfCurso = false;
  errorPdfCurso: string | null = null;


  idAsignaturaNotas: number | null = null;

  estudiantesNotas: FilaNotas[] = [];
  actividadesNotasColumnas: EvaluativeActivityResponseDTO[] = [];

  cargandoNotas = false;
  errorNotas: string | null = null;
  notasConsultadas = false;

  celdas = new Map<string, CeldaEstado>();
  errorGuardado: string | null = null;

  private idTeacherAsignaturaActual: number | null = null;


  formEscala = {
    minimumValue: 0,
    maximumValue: 5,
    minimumPassGrade: 3
  };

  guardandoEscala = false;
  errorEscala: string | null = null;

  nuevoTipo = { letterGrade: '', numericGrade: null as number | null };
  guardandoTipo = false;
  errorTipo: string | null = null;

  idPeriodoPasos: number | null = null;
  pasosPeriodo: PasoPeriodo[] = [];
  pasosYaDefinidos = false;
  guardandoPasos = false;
  errorPasos: string | null = null;

  constructor(private notasService: NotasService) {}

  ngOnInit(): void {

    this.cargandoBase = true;
    this.errorBase = null;

    forkJoin({
      niveles: this.notasService.listarNiveles(),
      cursos: this.notasService.listarCursos(),
      periodos: this.notasService.listarPeriodos(),
      asignaturas: this.notasService.listarAsignaturas(),
      escalas: this.notasService.listarEscalas(),
      tipos: this.notasService.listarTiposEvaluacion(),
      actividades: this.notasService.listarActividadesEvaluativas()
    }).subscribe({

      next: ({ niveles, cursos, periodos, asignaturas, escalas, tipos, actividades }) => {

        this.niveles = niveles;
        this.cursos = cursos.filter(c => c.status);
        this.periodos = periodos;
        this.asignaturas = asignaturas;

        this.escalaActual = escalas.length ? escalas[escalas.length - 1] : null;
        this.tiposEvaluacion = tipos;
        this.actividadesEvaluativas = actividades;

        if (this.escalaActual) {
          this.formEscala = {
            minimumValue: this.escalaActual.minimumValue,
            maximumValue: this.escalaActual.maximumValue,
            minimumPassGrade: this.escalaActual.minimumPassGrade
          };
        }

        if (this.cursos.length) {
          this.idCursoSeleccionado = this.cursos[0].idCourse;
        }

        const periodoActivo = this.periodos.find(p => p.status);
        this.idPeriodoSeleccionado = (periodoActivo ?? this.periodos[0])?.idPeriod ?? null;
        this.idPeriodoPasos = this.idPeriodoSeleccionado;
        this.idPeriodoReporte = this.idPeriodoSeleccionado;

        if (this.asignaturas.length) {
          this.idAsignaturaNotas = this.asignaturas[0].idSubject;
        }

        this.cargandoBase = false;

        this.cargarHistorial();
        this.actualizarPasosPeriodo();
      },

      error: () => {
        this.errorBase = 'No se pudo cargar la información base del módulo de notas.';
        this.cargandoBase = false;
      }
    });
  }


  cambiarTab(tab: Tab): void {
    this.tabActiva = tab;

    if (tab === 'historial' && !this.historialConsultado) {
      this.cargarHistorial();
    }

    if (tab === 'notas' && !this.notasConsultadas) {
      this.cargarNotas();
    }
  }

  get cursoSeleccionadoNombre(): string {
    return this.cursos.find(c => c.idCourse === this.idCursoSeleccionado)?.name ?? 'Selecciona un curso';
  }

  onCambioCursoGlobal(): void {
    this.historialConsultado = false;
    this.notasConsultadas = false;
    this.celdas.clear();

    if (this.tabActiva === 'historial') {
      this.cargarHistorial();
    } else if (this.tabActiva === 'notas') {
      this.cargarNotas();
    }
  }

  onCambioPeriodoGlobal(): void {
    this.onCambioCursoGlobal();
  }


  cargarHistorial(): void {

    if (this.idCursoSeleccionado === null || this.idPeriodoSeleccionado === null) {
      return;
    }

    this.cargandoHistorial = true;
    this.errorHistorial = null;
    this.historialConsultado = true;

    const idCurso = this.idCursoSeleccionado;
    const idPeriodo = this.idPeriodoSeleccionado;

    this.notasService.listarCargaPorCurso(idCurso).subscribe({

      next: cargas => {

        const idsAsignaturas = Array.from(new Set(cargas.map(c => c.idSubject)));

        if (!idsAsignaturas.length) {
          this.resumenAsignaturas = [];
          this.promedioGeneral = 0;
          this.cargandoHistorial = false;
          return;
        }

        const llamadas = idsAsignaturas.map(idSubject =>
          this.notasService.obtenerNotasPorCurso(idCurso, idSubject, idPeriodo).pipe(
            map(notas => ({ idSubject, notas })),
            catchError(() => of({ idSubject, notas: [] as GradeDetailResponseDTO[] }))
          )
        );

        forkJoin(llamadas).subscribe({

          next: resultados => {

            const maximo = this.escalaActual?.maximumValue ?? 5;

            this.resumenAsignaturas = resultados.map(({ idSubject, notas }) => {

              const nombre = this.asignaturas.find(a => a.idSubject === idSubject)?.name
                ?? notas[0]?.subjectName
                ?? `Asignatura ${idSubject}`;

              const promedio = notas.length
                ? Math.round((notas.reduce((acc, n) => acc + Number(n.gradeValue), 0) / notas.length) * 100) / 100
                : 0;

              return {
                idSubject,
                nombre,
                promedio,
                porcentaje: maximo > 0 ? Math.min(100, Math.round((promedio / maximo) * 100)) : 0,
                totalNotas: notas.length
              };
            });

            const conNotas = this.resumenAsignaturas.filter(r => r.totalNotas > 0);

            this.promedioGeneral = conNotas.length
              ? Math.round((conNotas.reduce((acc, r) => acc + r.promedio, 0) / conNotas.length) * 100) / 100
              : 0;

            this.cargandoHistorial = false;
          },

          error: () => {
            this.errorHistorial = 'No se pudo cargar el historial de notas del curso.';
            this.cargandoHistorial = false;
          }
        });
      },

      error: () => {
        this.errorHistorial = 'No se pudo cargar la carga académica del curso.';
        this.cargandoHistorial = false;
      }
    });
  }

  get maximoEscala(): number {
    return this.escalaActual?.maximumValue ?? 5;
  }


  onCambioNivelReporte(): void {

    this.idCursoReporte = null;
    this.estudiantesReporte = [];
    this.seleccionadosReporte.clear();
    this.vistaPreviaGenerada = false;
    this.vistaPrevia = [];

    if (this.idNivelReporte === null) {
      this.cursosReporte = [];
      return;
    }

    this.notasService.listarCursosPorNivel(this.idNivelReporte).subscribe({
      next: cursos => {
        this.cursosReporte = cursos.filter(c => c.status);
        if (this.cursosReporte.length) {
          this.idCursoReporte = this.cursosReporte[0].idCourse;
          this.onCambioCursoReporte();
        }
      },
      error: () => {
        this.cursosReporte = [];
      }
    });
  }

  onCambioCursoReporte(): void {

    this.estudiantesReporte = [];
    this.seleccionadosReporte.clear();
    this.vistaPreviaGenerada = false;
    this.vistaPrevia = [];

    if (this.idCursoReporte === null) {
      return;
    }

    this.cargandoEstudiantesReporte = true;
    this.errorReporte = null;

    this.notasService.listarEstudiantesPorCurso(this.idCursoReporte).subscribe({
      next: estudiantes => {
        this.estudiantesReporte = estudiantes.filter(e => e.status !== false);
        this.cargandoEstudiantesReporte = false;
      },
      error: () => {
        this.errorReporte = 'No se pudo cargar el listado de estudiantes.';
        this.cargandoEstudiantesReporte = false;
      }
    });
  }

  toggleEstudianteReporte(idUser: number): void {
    if (this.seleccionadosReporte.has(idUser)) {
      this.seleccionadosReporte.delete(idUser);
    } else {
      this.seleccionadosReporte.add(idUser);
    }
  }

  get todosSeleccionadosReporte(): boolean {
    return this.estudiantesReporte.length > 0 &&
      this.estudiantesReporte.every(e => this.seleccionadosReporte.has(e.idUser));
  }

  toggleTodosReporte(): void {
    if (this.todosSeleccionadosReporte) {
      this.seleccionadosReporte.clear();
    } else {
      this.estudiantesReporte.forEach(e => this.seleccionadosReporte.add(e.idUser));
    }
  }

  regenerarVistaPrevia(): void {

    if (!this.seleccionadosReporte.size || this.idPeriodoReporte === null) {
      this.errorReporte = 'Selecciona al menos un estudiante y un periodo.';
      return;
    }

    this.cargandoVistaPrevia = true;
    this.errorReporte = null;

    const idPeriodo = this.idPeriodoReporte;

    const llamadas = Array.from(this.seleccionadosReporte).map(idStudent => {
      const estudiante = this.estudiantesReporte.find(e => e.idUser === idStudent)!;

      return this.notasService.obtenerNotasPorEstudiante(idStudent, idPeriodo).pipe(
        map(notas => {
          const promedio = notas.length
            ? Math.round((notas.reduce((acc, n) => acc + Number(n.gradeValue), 0) / notas.length) * 100) / 100
            : 0;

          const resumen: ResumenReporteEstudiante = { estudiante, notas, promedio };
          return resumen;
        }),
        catchError(() => of({ estudiante, notas: [] as GradeDetailResponseDTO[], promedio: 0 }))
      );
    });

    forkJoin(llamadas).subscribe({
      next: resultados => {
        this.vistaPrevia = resultados;
        this.vistaPreviaGenerada = true;
        this.cargandoVistaPrevia = false;
      },
      error: () => {
        this.errorReporte = 'No se pudo generar la vista previa del reporte.';
        this.cargandoVistaPrevia = false;
      }
    });
  }

  get nombreCursoReporte(): string {
    return this.cursosReporte.find(c => c.idCourse === this.idCursoReporte)?.name ?? '';
  }

  get nombrePeriodoReporte(): string {
    return this.periodos.find(p => p.idPeriod === this.idPeriodoReporte)?.name ?? '';
  }

  descargarReportePdf(): void {

    if (!this.vistaPreviaGenerada || this.idPeriodoReporte === null || !this.seleccionadosReporte.size) {
      return;
    }

    const idPeriodo = this.idPeriodoReporte;
    const ids = Array.from(this.seleccionadosReporte);

    this.descargandoPdf = true;
    this.errorReporte = null;

    from(ids).pipe(
      concatMap(idStudent =>
        this.notasService.descargarPdfEstudiante(idStudent, idPeriodo).pipe(
          tap(blob => {
            const estudiante = this.estudiantesReporte.find(e => e.idUser === idStudent);
            const nombreArchivo = estudiante
              ? `notas_${estudiante.name}_${estudiante.surnames}_periodo_${idPeriodo}.pdf`.replace(/\s+/g, '_')
              : `notas_estudiante_${idStudent}_periodo_${idPeriodo}.pdf`;
            this.descargarBlob(blob, nombreArchivo);
          }),
          catchError(() => {
            this.errorReporte = 'No se pudo generar el PDF de uno o más estudiantes.';
            return of(null);
          }),
          delay(250)
        )
      )
    ).subscribe({
      complete: () => { this.descargandoPdf = false; }
    });
  }

  /** Descarga el PDF de notas del curso/asignatura/periodo que se está viendo en la pestaña "Notas". */
  descargarPdfCurso(): void {

    if (this.idCursoSeleccionado === null || this.idAsignaturaNotas === null || this.idPeriodoSeleccionado === null) {
      return;
    }

    this.descargandoPdfCurso = true;
    this.errorPdfCurso = null;

    const idCurso = this.idCursoSeleccionado;
    const idSubject = this.idAsignaturaNotas;
    const idPeriodo = this.idPeriodoSeleccionado;

    const nombreCurso = this.cursoSeleccionadoNombre;
    const nombreAsignatura = this.asignaturas.find(a => a.idSubject === idSubject)?.name ?? `asignatura_${idSubject}`;
    const nombreArchivo = `notas_${nombreCurso}_${nombreAsignatura}_periodo_${idPeriodo}.pdf`.replace(/\s+/g, '_');

    this.notasService.descargarPdfCurso(idCurso, idSubject, idPeriodo).subscribe({
      next: blob => {
        this.descargarBlob(blob, nombreArchivo);
        this.descargandoPdfCurso = false;
      },
      error: () => {
        this.errorPdfCurso = 'No se pudo generar el PDF del curso.';
        this.descargandoPdfCurso = false;
      }
    });
  }

  private descargarBlob(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }


  cargarNotas(): void {

    if (this.idCursoSeleccionado === null || this.idAsignaturaNotas === null || this.idPeriodoSeleccionado === null) {
      return;
    }

    this.cargandoNotas = true;
    this.errorNotas = null;
    this.notasConsultadas = true;
    this.celdas.clear();

    const idCurso = this.idCursoSeleccionado;
    const idSubject = this.idAsignaturaNotas;
    const idPeriodo = this.idPeriodoSeleccionado;

    this.actividadesNotasColumnas = this.actividadesEvaluativas.filter(
      a => a.idPeriod === idPeriodo && a.isActive
    );

    if (!this.actividadesNotasColumnas.length) {
      this.errorNotas = 'No hay actividades evaluativas configuradas para este periodo. Ve a la pestaña "Calificación" y define los pasos del periodo.';
    }

    forkJoin({
      estudiantes: this.notasService.listarEstudiantesPorCurso(idCurso),
      cargas: this.notasService.listarCargaPorCurso(idCurso),
      notas: this.notasService.obtenerNotasPorCurso(idCurso, idSubject, idPeriodo)
    }).subscribe({

      next: ({ estudiantes, cargas, notas }) => {

        this.estudiantesNotas = estudiantes
          .filter(e => e.status !== false)
          .map(e => ({ estudiante: e, nombreCompleto: `${e.name} ${e.surnames}`.trim() }))
          .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

        const carga = cargas.find(c => c.idSubject === idSubject && c.status);
        this.idTeacherAsignaturaActual = carga?.idTeacher ?? null;

        if (!carga) {
          this.errorNotas = (this.errorNotas ? this.errorNotas + ' ' : '') +
            'No hay un docente asignado a esta asignatura en este curso (carga académica).';
        }

        this.estudiantesNotas.forEach(fila => {
          this.actividadesNotasColumnas.forEach(actividad => {

            const clave = this.claveCelda(fila.estudiante.idUser, actividad.idEvaluative);

            const notaExistente = notas.find(
              n => n.idStudent === fila.estudiante.idUser && n.idEvaluative === actividad.idEvaluative
            );

            this.celdas.set(clave, {
              valor: notaExistente ? String(notaExistente.gradeValue) : '',
              idGrade: notaExistente?.idGrade ?? null,
              guardando: false,
              error: null
            });
          });
        });

        this.cargandoNotas = false;
      },

      error: () => {
        this.errorNotas = 'No se pudo cargar el listado de estudiantes o las notas del curso.';
        this.cargandoNotas = false;
      }
    });
  }

  claveCelda(idStudent: number, idEvaluative: number): string {
    return `${idStudent}_${idEvaluative}`;
  }

  obtenerCelda(idStudent: number, idEvaluative: number): CeldaEstado {
    const clave = this.claveCelda(idStudent, idEvaluative);
    return this.celdas.get(clave) ?? { valor: '', idGrade: null, guardando: false, error: null };
  }

  onCambioCelda(idStudent: number, idEvaluative: number, valor: string | number): void {
    const clave = this.claveCelda(idStudent, idEvaluative);
    const actual = this.celdas.get(clave) ?? { valor: '', idGrade: null, guardando: false, error: null };
    this.celdas.set(clave, { ...actual, valor: String(valor ?? ''), error: null });
    this.errorGuardado = null;
  }

  guardarCelda(fila: FilaNotas, actividad: EvaluativeActivityResponseDTO): void {
    try {
      this.intentarGuardarCelda(fila, actividad);
    } catch (e) {
      console.error('Error inesperado al guardar la celda de notas', e);
      this.errorGuardado = 'Ocurrió un error inesperado al intentar guardar la nota. Revisa la consola para más detalle.';
    }
  }

  private intentarGuardarCelda(fila: FilaNotas, actividad: EvaluativeActivityResponseDTO): void {

    if (this.idCursoSeleccionado === null || this.idAsignaturaNotas === null || this.idPeriodoSeleccionado === null) {
      return;
    }

    const clave = this.claveCelda(fila.estudiante.idUser, actividad.idEvaluative);
    const celda = this.celdas.get(clave);

    if (!celda || String(celda.valor).trim() === '') {
      return;
    }

    const valorNumerico = Number(celda.valor);

    if (Number.isNaN(valorNumerico)) {
      this.celdas.set(clave, { ...celda, error: 'Valor inválido' });
      return;
    }

    if (this.escalaActual &&
        (valorNumerico < this.escalaActual.minimumValue || valorNumerico > this.escalaActual.maximumValue)) {
      this.celdas.set(clave, {
        ...celda,
        error: `Debe estar entre ${this.escalaActual.minimumValue} y ${this.escalaActual.maximumValue}`
      });
      return;
    }

    if (this.idTeacherAsignaturaActual === null) {
      this.celdas.set(clave, { ...celda, error: 'Sin docente asignado a la asignatura' });
      return;
    }

    const tipo = this.encontrarTipoEvaluacion(valorNumerico);

    if (!tipo) {
      this.celdas.set(clave, {
        ...celda,
        error: 'Configura los tipos de calificación en "Calificación"'
      });
      return;
    }

    this.celdas.set(clave, { ...celda, guardando: true, error: null });
    this.errorGuardado = null;

    const dto: GradeRequestDTO = {
      idStudent: fila.estudiante.idUser,
      idCourse: this.idCursoSeleccionado,
      idTeacher: this.idTeacherAsignaturaActual,
      idPeriod: this.idPeriodoSeleccionado,
      idSubject: this.idAsignaturaNotas,
      idEvaluative: actividad.idEvaluative,
      idEvaluationType: tipo.idEvaluationType,
      gradeValue: valorNumerico
    };

    const peticion = celda.idGrade
      ? this.notasService.actualizarNota(celda.idGrade, dto)
      : this.notasService.registrarNota(dto);

    peticion.subscribe({
      next: resultado => {
        this.celdas.set(clave, {
          valor: String(resultado.gradeValue),
          idGrade: resultado.idGrade,
          guardando: false,
          error: null
        });
      },
      error: (err) => {
        const mensaje = err?.error?.message ?? err?.error?.error ?? 'No se pudo guardar la nota';
        this.celdas.set(clave, { ...celda, guardando: false, error: mensaje });

        if (err?.status === 401 || err?.status === 403) {
          this.errorGuardado = 'No tienes permisos para registrar notas con tu rol actual. '
            + 'El registro y edición de notas está reservado a usuarios con rol Docente. '
            + 'Inicia sesión con una cuenta de docente para guardar calificaciones.';
        } else {
          this.errorGuardado = mensaje;
        }
      }
    });
  }

  private encontrarTipoEvaluacion(valor: number): EvaluationTypeResponseDTO | null {

    if (!this.escalaActual) {
      return null;
    }

    const candidatos = this.tiposEvaluacion.filter(
      t => t.idScale === this.escalaActual!.idScale && t.numericGrade !== null && t.numericGrade !== undefined
    );

    if (!candidatos.length) {
      return null;
    }

    return candidatos.reduce((mejor, actual) =>
      Math.abs(Number(actual.numericGrade) - valor) < Math.abs(Number(mejor.numericGrade) - valor) ? actual : mejor
    );
  }


  guardarEscala(): void {

    if (this.formEscala.minimumValue >= this.formEscala.maximumValue) {
      this.errorEscala = 'El valor mínimo debe ser menor que el máximo.';
      return;
    }

    if (this.formEscala.minimumPassGrade < this.formEscala.minimumValue ||
        this.formEscala.minimumPassGrade > this.formEscala.maximumValue) {
      this.errorEscala = 'La meta de aprobación debe estar dentro del rango.';
      return;
    }

    this.guardandoEscala = true;
    this.errorEscala = null;

    const dto = { ...this.formEscala };

    const peticion = this.escalaActual
      ? this.notasService.actualizarEscala(this.escalaActual.idScale, dto)
      : this.notasService.registrarEscala(dto);

    peticion.subscribe({
      next: escala => {
        this.escalaActual = escala;
        this.guardandoEscala = false;
      },
      error: (err) => {
        this.errorEscala = err?.error?.message ?? 'No se pudo guardar la escala de calificación.';
        this.guardandoEscala = false;
      }
    });
  }

  guardarCambiosCalificacion(): void {
    this.guardarEscala();
    if (!this.pasosYaDefinidos) {
      this.guardarPasos();
    }
  }

  descartarCambiosCalificacion(): void {
    this.descartarEscala();
    this.descartarPasos();
  }

  descartarEscala(): void {
    if (this.escalaActual) {
      this.formEscala = {
        minimumValue: this.escalaActual.minimumValue,
        maximumValue: this.escalaActual.maximumValue,
        minimumPassGrade: this.escalaActual.minimumPassGrade
      };
    }
    this.errorEscala = null;
  }

  get tiposDeLaEscala(): EvaluationTypeResponseDTO[] {
    if (!this.escalaActual) {
      return [];
    }
    return this.tiposEvaluacion.filter(t => t.idScale === this.escalaActual!.idScale);
  }

  guardarNuevoTipo(): void {

    if (!this.escalaActual) {
      this.errorTipo = 'Primero guarda la escala de calificación.';
      return;
    }

    if (!this.nuevoTipo.letterGrade.trim() || this.nuevoTipo.numericGrade === null) {
      this.errorTipo = 'Indica un nombre y un valor numérico de referencia.';
      return;
    }

    this.guardandoTipo = true;
    this.errorTipo = null;

    this.notasService.registrarTipoEvaluacion({
      idScale: this.escalaActual.idScale,
      letterGrade: this.nuevoTipo.letterGrade.trim(),
      numericGrade: this.nuevoTipo.numericGrade
    }).subscribe({
      next: tipo => {
        this.tiposEvaluacion = [...this.tiposEvaluacion, tipo];
        this.nuevoTipo = { letterGrade: '', numericGrade: null };
        this.guardandoTipo = false;
      },
      error: (err) => {
        this.errorTipo = err?.error?.message ?? 'No se pudo registrar el tipo de calificación.';
        this.guardandoTipo = false;
      }
    });
  }

  // ── Pasos por periodo (actividades evaluativas) ──

  onCambioPeriodoPasos(): void {
    this.actualizarPasosPeriodo();
  }

  private actualizarPasosPeriodo(): void {

    const existentes = this.actividadesEvaluativas.filter(a => a.idPeriod === this.idPeriodoPasos);

    if (existentes.length) {
      this.pasosYaDefinidos = true;
      this.pasosPeriodo = existentes.map(a => ({
        idEvaluative: a.idEvaluative,
        evaluationName: a.evaluationName,
        weightPercentage: a.weightPercentage,
        existente: true
      }));
    } else {
      this.pasosYaDefinidos = false;
      this.pasosPeriodo = [
        { idEvaluative: null, evaluationName: 'Actividades', weightPercentage: 30, existente: false },
        { idEvaluative: null, evaluationName: 'Evaluación', weightPercentage: 50, existente: false },
        { idEvaluative: null, evaluationName: 'Examen final', weightPercentage: 20, existente: false }
      ];
    }

    this.errorPasos = null;
  }

  ajustarPaso(paso: PasoPeriodo, delta: number): void {
    if (paso.existente) {
      return;
    }
    const nuevo = paso.weightPercentage + delta;
    paso.weightPercentage = Math.min(100, Math.max(0, nuevo));
  }

  get totalPorcentajePasos(): number {
    return this.pasosPeriodo.reduce((acc, p) => acc + Number(p.weightPercentage || 0), 0);
  }

  descartarPasos(): void {
    this.actualizarPasosPeriodo();
  }

  guardarPasos(): void {

    if (this.pasosYaDefinidos) {
      return;
    }

    if (this.idPeriodoPasos === null) {
      this.errorPasos = 'Selecciona un periodo.';
      return;
    }

    if (this.totalPorcentajePasos !== 100) {
      this.errorPasos = 'La suma de los pasos debe ser exactamente 100%.';
      return;
    }

    const periodo = this.periodos.find(p => p.idPeriod === this.idPeriodoPasos);

    if (!periodo) {
      this.errorPasos = 'Periodo no encontrado.';
      return;
    }

    this.guardandoPasos = true;
    this.errorPasos = null;

    const llamadas = this.pasosPeriodo.map(paso =>
      this.notasService.registrarActividadEvaluativa({
        idPeriod: periodo.idPeriod,
        startDate: periodo.startDate,
        endDate: periodo.endDate,
        evaluationName: paso.evaluationName,
        weightPercentage: paso.weightPercentage
      })
    );

    forkJoin(llamadas).subscribe({
      next: creadas => {
        this.actividadesEvaluativas = [...this.actividadesEvaluativas, ...creadas];
        this.guardandoPasos = false;
        this.actualizarPasosPeriodo();
      },
      error: (err) => {
        this.errorPasos = err?.error?.message ?? 'No se pudieron guardar los pasos del periodo.';
        this.guardandoPasos = false;
      }
    });
  }
}