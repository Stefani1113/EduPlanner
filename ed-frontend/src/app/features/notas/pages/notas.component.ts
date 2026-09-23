import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

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

import {
  PerfilService,
  MiPerfilDTO
} from '../../admin/services/perfil.service';

import { ModalService } from '../../../core/services/modal.service';

type Tab = 'historial' | 'reportes' | 'notas' | 'calificacion';

interface ResumenAsignatura {
  idSubject: number;
  nombre: string;
  promedio: number;
  porcentaje: number;
  totalNotas: number;
  estado: string;
}

interface CeldaEstado {
  valor: number | null;
  original: number | null;
  guardando: boolean;
  error: string;
  idGrade?: number;
  idEvaluationType?: number;
}

interface FilaNotas {
  estudiante: UsuarioBasico;
  nombreCompleto: string;
  celdas: Record<number, CeldaEstado>;
  promedio: number;
}

interface PasoPeriodo {
  idEvaluative?: number;
  evaluationName: string;
  weightPercentage: number;
  startDate: string;
  endDate: string;
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
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss']
})
export class NotasComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  niveles: AcademicLevelResponseDTO[] = [];
  cursos: CourseResponseDTO[] = [];
  periodos: AcademicPeriodResponseDTO[] = [];
  asignaturas: SubjectResponseDTO[] = [];
  cargasAcademicas: AcademicLoadResponseDTO[] = [];
  estudiantes: UsuarioBasico[] = [];
  docentes: UsuarioBasico[] = [];
  escalas: GradingScaleResponseDTO[] = [];
  tiposEvaluacion: EvaluationTypeResponseDTO[] = [];
  actividadesEvaluativas: EvaluativeActivityResponseDTO[] = [];

  perfil: MiPerfilDTO | null = null;

  tabActiva: Tab = 'historial';

  esEstudiante = false;
  esDocente = false;
  esAdministrador = false;
  esDirectivo = false;

  idEstudianteActual: number | null = null;
  idCursoEstudiante: number | null = null;
  idDocenteActual: number | null = null;

  idNivelSeleccionado: number | null = null;
  idCursoSeleccionado: number | null = null;
  idPeriodoSeleccionado: number | null = null;
  idAsignaturaSeleccionada: number | null = null;
  idAsignaturaNotas: number | null = null;

  periodoSeleccionado: AcademicPeriodResponseDTO | null = null;
  cursoSeleccionado: CourseResponseDTO | null = null;
  asignaturaSeleccionada: SubjectResponseDTO | null = null;

  cargando = true;
  errorGeneral = '';

  cargandoHistorial = false;
  errorHistorial = '';

  historialNotas: GradeDetailResponseDTO[] = [];
  resumenAsignaturas: ResumenAsignatura[] = [];
  promedioGeneral = 0;
  estadoPromedio = '';

  cargandoNotas = false;
  errorNotas = '';
  errorGuardado = '';

  estudiantesNotas: FilaNotas[] = [];
  actividadesNotasColumnas: EvaluativeActivityResponseDTO[] = [];

  escalaActual: GradingScaleResponseDTO | null = null;

  descargandoPdfCurso = false;
  errorPdfCurso = '';

  idNivelReporte: number | null = null;
  idCursoReporte: number | null = null;
  idPeriodoReporte: number | null = null;

  cursosReporte: CourseResponseDTO[] = [];
  estudiantesReporte: UsuarioBasico[] = [];
  seleccionadosReporte = new Set<number>();
  todosSeleccionadosReporte = false;

  cargandoEstudiantesReporte = false;
  cargandoVistaPrevia = false;
  vistaPreviaGenerada = false;
  descargandoPdf = false;
  errorReporte = '';

  vistaPrevia: ResumenReporteEstudiante[] = [];

  idPeriodoPasos: number | null = null;
  pasosPeriodo: PasoPeriodo[] = [];
  pasosYaDefinidos = false;
  totalPorcentajePasos = 0;
  errorPasos = '';
  guardandoPasos = false;

  formEscala: GradingScaleResponseDTO = {
    idScale: 0,
    minimumValue: 0,
    maximumValue: 5,
    minimumPassGrade: 3
  };

  editandoEscala = false;
  guardandoEscala = false;
  errorEscala = '';

  nuevoTipo: {
    letterGrade: string;
    numericGrade: number | null;
  } = {
    letterGrade: '',
    numericGrade: null
  };

  guardandoTipo = false;
  errorTipo = '';

  actividadSeleccionada: EvaluativeActivityResponseDTO | null = null;

  constructor(
    private notasService: NotasService,
    private perfilService: PerfilService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.cargarInformacionInicial();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarInformacionInicial(): void {
    this.cargando = true;
    this.errorGeneral = '';

    forkJoin({
      niveles: this.notasService.listarNiveles().pipe(
        catchError(() => of([]))
      ),
      cursos: this.notasService.listarCursos().pipe(
        catchError(() => of([]))
      ),
      periodos: this.notasService.listarPeriodos().pipe(
        catchError(() => of([]))
      ),
      asignaturas: this.notasService.listarAsignaturas().pipe(
        catchError(() => of([]))
      ),
      escalas: this.notasService.listarEscalas().pipe(
        catchError(() => of([]))
      ),
      tiposEvaluacion: this.notasService.listarTiposEvaluacion().pipe(
        catchError(() => of([]))
      ),
      actividades: this.notasService.listarActividadesEvaluativas().pipe(
        catchError(() => of([]))
      ),
      perfil: this.perfilService.obtenerMiPerfil().pipe(
        catchError(() => of(null))
      )
    })
    .pipe(
      finalize(() => {
        this.cargando = false;
      })
    )
    .subscribe({
      next: respuesta => {
        this.niveles = respuesta.niveles.filter(n => n.status);
        this.cursos = respuesta.cursos.filter(c => c.status);
        this.periodos = respuesta.periodos;
        this.asignaturas = respuesta.asignaturas.filter(a => a.status);
        this.escalas = respuesta.escalas;
        this.tiposEvaluacion = respuesta.tiposEvaluacion;
        this.actividadesEvaluativas = respuesta.actividades;

        this.perfil = respuesta.perfil?.data ?? null;

        this.configurarRol();
        this.seleccionarPeriodoActivo();
        this.configurarDatosSegunRol();

        if (!this.esDirectivo) {
          this.configurarEscala();
          this.configurarPasosPeriodo();
          this.configurarReporteGeneral();
        }
      },
      error: () => {
        this.errorGeneral = 'No fue posible cargar la información académica.';
      }
    });
  }

  configurarRol(): void {
    const rol = String(
      this.perfil?.roleName ??
      this.perfil?.position ??
      ''
    ).toUpperCase();

    this.esEstudiante = rol.includes('ESTUDIANTE');
    this.esDocente = rol.includes('DOCENTE');
    this.esDirectivo = rol.includes('DIRECTIVO');
    this.esAdministrador =
      rol.includes('ADMINISTRADOR') ||
      rol === 'ADMIN';

    this.idEstudianteActual =
      this.perfil?.idUser ??
      null;

    this.idCursoEstudiante =
      this.perfil?.idCourse ??
      null;

    this.idDocenteActual =
      this.perfil?.idUser ??
      null;

    if (this.esDirectivo) {
      this.tabActiva = 'historial';
    }
  }

  configurarDatosSegunRol(): void {
    if (this.esEstudiante) {
      this.idCursoSeleccionado = this.idCursoEstudiante;

      this.cursoSeleccionado =
        this.cursos.find(
          c => c.idCourse === this.idCursoSeleccionado
        ) ?? null;

      if (this.idCursoSeleccionado !== null) {
        this.cargarCargaAcademicaEstudiante();
      }

      this.cargarHistorial();
      return;
    }

    if (this.cursos.length && this.idCursoSeleccionado === null) {
      this.idCursoSeleccionado = this.cursos[0].idCourse;
      this.cursoSeleccionado = this.cursos[0];
    }

    this.cargarHistorial();

    if (this.idCursoSeleccionado !== null) {
      this.cargarAsignaturasPorCurso(this.idCursoSeleccionado);
    }
  }

  seleccionarPeriodoActivo(): void {
    const periodo =
      this.periodos.find(p => p.status) ??
      this.periodos[0] ??
      null;

    if (!periodo) {
      this.idPeriodoSeleccionado = null;
      this.periodoSeleccionado = null;
      return;
    }

    this.idPeriodoSeleccionado = periodo.idPeriod;
    this.periodoSeleccionado = periodo;

    this.idPeriodoReporte = periodo.idPeriod;
    this.idPeriodoPasos = periodo.idPeriod;
  }

  seleccionarPeriodo(idPeriodo: number): void {
    this.idPeriodoSeleccionado = idPeriodo;

    this.periodoSeleccionado =
      this.periodos.find(
        p => p.idPeriod === idPeriodo
      ) ?? null;

    this.cargarHistorial();

    if (
      this.tabActiva === 'notas' &&
      !this.esDirectivo &&
      this.idCursoSeleccionado !== null &&
      this.idAsignaturaNotas !== null
    ) {
      this.cargarNotas();
    }

    if (!this.esDirectivo) {
      this.configurarPasosPeriodo();
    }
  }

  onCambioPeriodoGlobal(): void {
    if (this.idPeriodoSeleccionado === null) {
      return;
    }

    this.seleccionarPeriodo(this.idPeriodoSeleccionado);
  }

  seleccionarNivel(idNivel: number): void {
    if (this.esEstudiante) {
      return;
    }

    this.idNivelSeleccionado = idNivel;

    this.cargarCursos(idNivel);
  }

  cargarCursos(idNivel?: number): void {
    const solicitud = idNivel
      ? this.notasService.listarCursosPorNivel(idNivel)
      : this.notasService.listarCursos();

    solicitud.subscribe({
      next: cursos => {
        this.cursos = cursos.filter(c => c.status);

        if (
          this.idCursoSeleccionado === null &&
          this.cursos.length
        ) {
          this.idCursoSeleccionado = this.cursos[0].idCourse;
          this.cursoSeleccionado = this.cursos[0];
          this.cargarHistorial();
        }
      }
    });
  }

  seleccionarCurso(idCurso: number): void {
    if (this.esEstudiante) {
      return;
    }

    this.idCursoSeleccionado = idCurso;

    this.cursoSeleccionado =
      this.cursos.find(
        c => c.idCourse === idCurso
      ) ?? null;

    this.idAsignaturaSeleccionada = null;
    this.asignaturaSeleccionada = null;

    this.cargarAsignaturasPorCurso(idCurso);
    this.cargarHistorial();

    if (!this.esDirectivo) {
      this.configurarReporteGeneral();
    }
  }

  onCambioCursoGlobal(): void {
    if (this.esEstudiante) {
      return;
    }

    if (this.idCursoSeleccionado === null) {
      this.cursoSeleccionado = null;
      this.idAsignaturaSeleccionada = null;
      this.idAsignaturaNotas = null;
      this.asignaturaSeleccionada = null;
      this.cargasAcademicas = [];
      this.estudiantesNotas = [];
      this.historialNotas = [];
      this.resumenAsignaturas = [];
      this.promedioGeneral = 0;
      return;
    }

    this.seleccionarCurso(this.idCursoSeleccionado);
  }

  seleccionarAsignatura(idAsignatura: number): void {
    if (this.esEstudiante || this.esDirectivo) {
      return;
    }

    this.idAsignaturaSeleccionada = idAsignatura;
    this.idAsignaturaNotas = idAsignatura;

    this.asignaturaSeleccionada =
      this.asignaturas.find(
        a => a.idSubject === idAsignatura
      ) ?? null;

    if (this.tabActiva === 'notas') {
      this.cargarNotas();
    }
  }

  cambiarTab(tab: Tab): void {
    if (this.esDirectivo) {
      this.tabActiva = 'historial';
      return;
    }

    if (
      this.esEstudiante &&
      tab === 'calificacion'
    ) {
      return;
    }

    this.tabActiva = tab;

    if (tab === 'historial') {
      this.cargarHistorial();
    }

    if (tab === 'reportes') {
      this.configurarReporteGeneral();
    }

    if (
      tab === 'notas' &&
      this.idCursoSeleccionado !== null
    ) {
      if (this.idAsignaturaNotas === null) {
        this.idAsignaturaNotas =
          this.asignaturas[0]?.idSubject ?? null;
      }

      if (this.idAsignaturaNotas !== null) {
        this.cargarNotas();
      }
    }

    if (tab === 'calificacion') {
      this.configurarEscala();
      this.configurarPasosPeriodo();
    }
  }

  cargarCargaAcademicaEstudiante(): void {
    if (this.idCursoEstudiante === null) {
      return;
    }

    this.notasService
      .listarCargaPorCurso(this.idCursoEstudiante)
      .subscribe({
        next: carga => {
          this.cargasAcademicas =
            carga.filter(c => c.status);

          const ids = new Set(
            this.cargasAcademicas.map(
              c => c.idSubject
            )
          );

          this.asignaturas =
            this.asignaturas.filter(
              a => ids.has(a.idSubject)
            );
        }
      });
  }

  cargarAsignaturasPorCurso(idCurso: number): void {
    this.notasService
      .listarCargaPorCurso(idCurso)
      .subscribe({
        next: carga => {
          this.cargasAcademicas =
            carga.filter(c => c.status);

          const ids = new Set(
            this.cargasAcademicas.map(
              c => c.idSubject
            )
          );

          const todas =
            this.asignaturas.length
              ? this.asignaturas
              : [];

          this.asignaturas =
            todas.filter(
              a => ids.has(a.idSubject)
            );

          if (
            this.idAsignaturaNotas === null &&
            this.asignaturas.length
          ) {
            this.idAsignaturaNotas =
              this.asignaturas[0].idSubject;
          }
        }
      });
  }

  cargarHistorial(): void {
    if (this.esDirectivo && this.idCursoSeleccionado === null) {
      if (this.cursos.length) {
        this.idCursoSeleccionado =
          this.cursos[0].idCourse;

        this.cursoSeleccionado =
          this.cursos[0];
      }
    }

    if (this.idPeriodoSeleccionado === null) {
      this.historialNotas = [];
      this.resumenAsignaturas = [];
      this.promedioGeneral = 0;
      return;
    }

    this.cargandoHistorial = true;
    this.errorHistorial = '';

    if (
      this.esEstudiante &&
      this.idEstudianteActual !== null
    ) {
      this.notasService
        .obtenerNotasPorEstudiante(
          this.idEstudianteActual,
          this.idPeriodoSeleccionado
        )
        .pipe(
          finalize(() => {
            this.cargandoHistorial = false;
          })
        )
        .subscribe({
          next: notas => {
            this.historialNotas =
              this.idCursoEstudiante !== null
                ? notas.filter(
                    n =>
                      n.idCourse ===
                      this.idCursoEstudiante
                  )
                : notas;

            this.generarResumenAsignaturas();
          },
          error: () => {
            this.errorHistorial =
              'No fue posible cargar el historial de notas.';
          }
        });

      return;
    }

    if (this.idCursoSeleccionado === null) {
      this.cargandoHistorial = false;
      this.historialNotas = [];
      this.resumenAsignaturas = [];
      this.promedioGeneral = 0;
      return;
    }

    this.notasService
      .listarCargaPorCurso(
        this.idCursoSeleccionado
      )
      .pipe(
        catchError(() => of([]))
      )
      .subscribe({
        next: carga => {
          const cargas = carga.filter(
            c => c.status
          );

          if (!cargas.length) {
            this.historialNotas = [];
            this.generarResumenAsignaturas();
            this.cargandoHistorial = false;
            return;
          }

          const solicitudes =
            cargas.map(cargaActual =>
              this.notasService
                .obtenerNotasPorCurso(
                  this.idCursoSeleccionado!,
                  cargaActual.idSubject,
                  this.idPeriodoSeleccionado!
                )
                .pipe(
                  catchError(() => of([]))
                )
            );

          forkJoin(solicitudes)
            .pipe(
              finalize(() => {
                this.cargandoHistorial = false;
              })
            )
            .subscribe({
              next: respuestas => {
                this.historialNotas =
                  respuestas.flat();

                this.generarResumenAsignaturas();
              },
              error: () => {
                this.errorHistorial =
                  'No fue posible cargar el historial de notas.';
              }
            });
        },
        error: () => {
          this.errorHistorial =
            'No fue posible cargar la información del curso.';
          this.cargandoHistorial = false;
        }
      });
  }

  generarResumenAsignaturas(): void {
    const grupos = new Map<
      number,
      GradeDetailResponseDTO[]
    >();

    this.historialNotas.forEach(nota => {
      const grupo =
        grupos.get(nota.idSubject) ?? [];

      grupo.push(nota);
      grupos.set(nota.idSubject, grupo);
    });

    const resumen: ResumenAsignatura[] = [];

    grupos.forEach((notas, idSubject) => {
      const valores = notas
        .map(n => Number(n.gradeValue))
        .filter(v => Number.isFinite(v));

      const promedio = valores.length
        ? valores.reduce(
            (total, valor) => total + valor,
            0
          ) / valores.length
        : 0;

      const nombre =
        notas[0]?.subjectName ??
        this.obtenerNombreAsignatura(idSubject);

      const maximo = this.maximoEscala || 5;

      resumen.push({
        idSubject,
        nombre,
        promedio,
        porcentaje:
          maximo > 0
            ? Math.min(
                100,
                Math.max(
                  0,
                  (promedio / maximo) * 100
                )
              )
            : 0,
        totalNotas: valores.length,
        estado: this.obtenerEstadoNota(promedio)
      });
    });

    this.resumenAsignaturas = resumen;

    const valoresGenerales =
      this.historialNotas
        .map(n => Number(n.gradeValue))
        .filter(v => Number.isFinite(v));

    this.promedioGeneral =
      valoresGenerales.length
        ? valoresGenerales.reduce(
            (total, valor) => total + valor,
            0
          ) / valoresGenerales.length
        : 0;

    this.estadoPromedio =
      this.obtenerEstadoNota(
        this.promedioGeneral
      );
  }

  obtenerEstadoNota(valor: number): string {
    const escala = this.escalaActual;

    if (!escala) {
      return '';
    }

    return valor >= escala.minimumPassGrade
      ? 'Aprobado'
      : 'Reprobado';
  }

  obtenerEscalaActual(): GradingScaleResponseDTO | null {
    return (
      this.escalas.find(
        e =>
          e.minimumValue <= 0 &&
          e.maximumValue >= 5
      ) ??
      this.escalas[0] ??
      null
    );
  }

  cargarNotas(): void {
    if (
      this.esDirectivo ||
      this.esEstudiante
    ) {
      return;
    }

    if (
      this.idCursoSeleccionado === null ||
      this.idAsignaturaNotas === null ||
      this.idPeriodoSeleccionado === null
    ) {
      return;
    }

    this.cargandoNotas = true;
    this.errorNotas = '';
    this.errorGuardado = '';

    forkJoin({
      estudiantes:
        this.notasService.listarEstudiantesPorCurso(
          this.idCursoSeleccionado
        ),
      notas:
        this.notasService.obtenerNotasPorCurso(
          this.idCursoSeleccionado,
          this.idAsignaturaNotas,
          this.idPeriodoSeleccionado
        ),
      carga:
        this.notasService.listarCargaPorCurso(
          this.idCursoSeleccionado
        )
    })
    .pipe(
      finalize(() => {
        this.cargandoNotas = false;
      })
    )
    .subscribe({
      next: respuesta => {
        this.estudiantes =
          respuesta.estudiantes.filter(
            e => e.status !== false
          );

        this.cargasAcademicas =
          respuesta.carga.filter(
            c => c.status
          );

        this.actividadesNotasColumnas =
          this.obtenerActividadesDelPeriodo();

        this.construirFilasNotas(
          this.estudiantes,
          respuesta.notas
        );
      },
      error: () => {
        this.errorNotas =
          'No fue posible cargar las notas.';
        this.estudiantesNotas = [];
      }
    });
  }

  construirFilasNotas(
    estudiantes: UsuarioBasico[],
    notas: GradeDetailResponseDTO[]
  ): void {
    this.estudiantesNotas =
      estudiantes.map(estudiante => {
        const celdas: Record<
          number,
          CeldaEstado
        > = {};

        this.actividadesNotasColumnas.forEach(
          actividad => {
            const nota = notas.find(
              n =>
                n.idStudent ===
                  estudiante.idUser &&
                n.idEvaluative ===
                  actividad.idEvaluative
            );

            celdas[actividad.idEvaluative] = {
              valor:
                nota?.gradeValue ??
                null,
              original:
                nota?.gradeValue ??
                null,
              guardando: false,
              error: '',
              idGrade:
                nota?.idGrade,
              idEvaluationType:
                nota?.idEvaluationType
            };
          }
        );

        return {
          estudiante,
          nombreCompleto:
            `${estudiante.name} ${estudiante.surnames}`.trim(),
          celdas,
          promedio:
            this.obtenerPromedioFila(
              celdas
            )
        };
      });
  }

  obtenerCelda(
    idStudent: number,
    idEvaluative: number
  ): CeldaEstado {
    const fila =
      this.estudiantesNotas.find(
        f =>
          f.estudiante.idUser ===
          idStudent
      );

    if (!fila) {
      return {
        valor: null,
        original: null,
        guardando: false,
        error: ''
      };
    }

    if (!fila.celdas[idEvaluative]) {
      fila.celdas[idEvaluative] = {
        valor: null,
        original: null,
        guardando: false,
        error: ''
      };
    }

    return fila.celdas[idEvaluative];
  }

  obtenerActividadesDelPeriodo(): EvaluativeActivityResponseDTO[] {
    if (this.idPeriodoSeleccionado === null) {
      return [];
    }

    return this.actividadesEvaluativas.filter(
      actividad =>
        actividad.idPeriod ===
        this.idPeriodoSeleccionado
    );
  }

  cargarNotasEstudiante(): void {
    if (
      !this.esEstudiante ||
      this.idEstudianteActual === null ||
      this.idPeriodoSeleccionado === null
    ) {
      return;
    }

    this.notasService
      .obtenerNotasPorEstudiante(
        this.idEstudianteActual,
        this.idPeriodoSeleccionado
      )
      .subscribe({
        next: notas => {
          this.historialNotas = notas;
          this.generarResumenAsignaturas();
        }
      });
  }

  onCambioCelda(
    idStudent: number,
    idEvaluative: number,
    valor: number | string
  ): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    const celda =
      this.obtenerCelda(
        idStudent,
        idEvaluative
      );

    const numero = Number(valor);

    celda.error = '';

    if (
      valor === '' ||
      valor === null ||
      !Number.isFinite(numero)
    ) {
      celda.valor = null;
      return;
    }

    celda.valor = numero;

    this.actualizarPromedioFila(
      idStudent
    );
  }

  guardarCelda(
    fila: FilaNotas,
    actividad: EvaluativeActivityResponseDTO
  ): void {
    if (
      !this.esDocente ||
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    const celda =
      fila.celdas[
        actividad.idEvaluative
      ];

    if (!celda) {
      return;
    }

    if (
      celda.valor ===
      celda.original
    ) {
      return;
    }

    this.intentarGuardarCelda(
      fila,
      actividad,
      celda
    );
  }

  intentarGuardarCelda(
    fila: FilaNotas,
    actividad: EvaluativeActivityResponseDTO,
    celda: CeldaEstado
  ): void {
    if (
      !this.esDocente ||
      this.idCursoSeleccionado === null ||
      this.idPeriodoSeleccionado === null ||
      this.idAsignaturaNotas === null
    ) {
      return;
    }

    if (celda.valor === null) {
      celda.error =
        'Ingrese una calificación válida.';
      return;
    }

    if (!this.validarNota(celda.valor)) {
      celda.error =
        `La nota debe estar entre ${this.escalaActual?.minimumValue ?? 0} y ${this.escalaActual?.maximumValue ?? 5}.`;
      return;
    }

    const tipo =
      this.encontrarTipoEvaluacion(
        celda.valor
      );

    if (!tipo) {
      celda.error =
        'No existe un tipo de evaluación para esta nota.';
      return;
    }

    const idTeacher =
      this.idDocenteActual ??
      this.cargasAcademicas.find(
        c =>
          c.idCourse ===
            this.idCursoSeleccionado &&
          c.idSubject ===
            this.idAsignaturaNotas
      )?.idTeacher ??
      0;

    if (!idTeacher) {
      celda.error =
        'No fue posible identificar al docente.';
      return;
    }

    const dto: GradeRequestDTO = {
      idStudent:
        fila.estudiante.idUser,
      idCourse:
        this.idCursoSeleccionado,
      idTeacher,
      idPeriod:
        this.idPeriodoSeleccionado,
      idSubject:
        this.idAsignaturaNotas,
      idEvaluative:
        actividad.idEvaluative,
      idEvaluationType:
        tipo.idEvaluationType,
      gradeValue:
        celda.valor
    };

    celda.guardando = true;
    celda.error = '';

    const solicitud =
      celda.idGrade
        ? this.notasService.actualizarNota(
            celda.idGrade,
            dto
          )
        : this.notasService.registrarNota(
            dto
          );

    solicitud
      .pipe(
        finalize(() => {
          celda.guardando = false;
        })
      )
      .subscribe({
        next: respuesta => {
          celda.original =
            respuesta.gradeValue;
          celda.valor =
            respuesta.gradeValue;
          celda.idGrade =
            respuesta.idGrade;
          celda.idEvaluationType =
            respuesta.idEvaluationType;

          this.actualizarPromedioFila(
            fila.estudiante.idUser
          );

          this.cargarHistorial();
        },
        error: () => {
          celda.error =
            'No fue posible guardar la calificación.';
        }
      });
  }

  encontrarTipoEvaluacion(
    valor: number
  ): EvaluationTypeResponseDTO | null {
    if (!this.escalaActual) {
      return null;
    }

    const disponibles =
      this.tiposEvaluacion.filter(
        t =>
          t.idScale ===
          this.escalaActual!.idScale
      );

    return (
      disponibles.find(
        t =>
          t.numericGrade !== null &&
          t.numericGrade !== undefined &&
          Number(t.numericGrade) ===
            Number(valor)
      ) ??
      disponibles.find(
        t =>
          t.numericGrade !== null &&
          t.numericGrade !== undefined &&
          Math.abs(
            Number(t.numericGrade) -
              Number(valor)
          ) < 0.01
      ) ??
      null
    );
  }

  actualizarPromedioFila(
    idStudent: number
  ): void {
    const fila =
      this.estudiantesNotas.find(
        f =>
          f.estudiante.idUser ===
          idStudent
      );

    if (!fila) {
      return;
    }

    fila.promedio =
      this.obtenerPromedioFila(
        fila.celdas
      );
  }

  obtenerPromedioFila(
    celdas: Record<
      number,
      CeldaEstado
    >
  ): number {
    const valores = Object.values(
      celdas
    )
      .map(c => c.valor)
      .filter(
        (valor): valor is number =>
          valor !== null &&
          Number.isFinite(valor)
      );

    if (!valores.length) {
      return 0;
    }

    return valores.reduce(
      (total, valor) =>
        total + valor,
      0
    ) / valores.length;
  }

  configurarReporteGeneral(): void {
    if (this.esDirectivo) {
      return;
    }

    if (this.periodos.length) {
      this.idPeriodoReporte =
        this.idPeriodoSeleccionado ??
        this.periodos[0].idPeriod;
    }

    if (this.esEstudiante) {
      this.configurarReporteEstudiante(
        this.idEstudianteActual ?? 0
      );
      return;
    }

    if (
      this.idNivelReporte === null &&
      this.niveles.length
    ) {
      this.idNivelReporte =
        this.niveles[0].idLevel;
    }

    this.cargarCursosReporte();
  }

  configurarReporteEstudiante(
    idStudent: number
  ): void {
    if (
      this.esDirectivo ||
      !this.esEstudiante ||
      !idStudent
    ) {
      return;
    }

    this.estudiantesReporte =
      this.perfil
        ? [{
            idUser:
              this.perfil.idUser,
            name:
              this.perfil.name ?? '',
            surnames:
              this.perfil.surnames ?? '',
            idCourse:
              this.perfil.idCourse ?? undefined
          }]
        : [];

    this.seleccionadosReporte.clear();
    this.seleccionadosReporte.add(
      idStudent
    );

    this.todosSeleccionadosReporte = true;
  }

  cargarCursosReporte(): void {
    if (
      this.esDirectivo ||
      this.idNivelReporte === null
    ) {
      return;
    }

    this.cursosReporte =
      this.cursos.filter(
        c =>
          c.idLevel ===
          this.idNivelReporte
      );

    if (
      this.idCursoReporte === null &&
      this.cursosReporte.length
    ) {
      this.idCursoReporte =
        this.cursosReporte[0].idCourse;
    }

    this.cargarEstudiantesReporte();
  }

  onCambioNivelReporte(): void {
    if (this.esDirectivo) {
      return;
    }

    this.idCursoReporte = null;
    this.estudiantesReporte = [];
    this.seleccionadosReporte.clear();
    this.todosSeleccionadosReporte = false;
    this.vistaPreviaGenerada = false;

    this.cargarCursosReporte();
  }

  onCambioCursoReporte(): void {
    if (this.esDirectivo) {
      return;
    }

    this.seleccionadosReporte.clear();
    this.todosSeleccionadosReporte = false;
    this.vistaPreviaGenerada = false;

    this.cargarEstudiantesReporte();
  }

  cargarEstudiantesReporte(): void {
    if (
      this.esDirectivo ||
      this.esEstudiante ||
      this.idCursoReporte === null
    ) {
      if (this.esEstudiante) {
        this.configurarReporteEstudiante(
          this.idEstudianteActual ?? 0
        );
      }
      return;
    }

    this.cargandoEstudiantesReporte = true;

    this.notasService
      .listarEstudiantesPorCurso(
        this.idCursoReporte
      )
      .pipe(
        finalize(() => {
          this.cargandoEstudiantesReporte =
            false;
        })
      )
      .subscribe({
        next: estudiantes => {
          this.estudiantesReporte =
            estudiantes.filter(
              e => e.status !== false
            );

          this.seleccionadosReporte.clear();
          this.todosSeleccionadosReporte =
            false;
        },
        error: () => {
          this.errorReporte =
            'No fue posible cargar los estudiantes.';
        }
      });
  }

  cargarPromediosReportes(): void {
    if (
      this.esDirectivo ||
      this.idPeriodoReporte === null
    ) {
      return;
    }

    const ids =
      Array.from(
        this.seleccionadosReporte
      );

    if (!ids.length) {
      this.vistaPrevia = [];
      return;
    }

    forkJoin(
      ids.map(idStudent =>
        this.notasService
          .obtenerNotasPorEstudiante(
            idStudent,
            this.idPeriodoReporte!
          )
          .pipe(
            catchError(() => of([]))
          )
      )
    ).subscribe({
      next: respuestas => {
        this.vistaPrevia =
          respuestas.map(
            (notas, indice) => {
              const estudiante =
                this.estudiantesReporte.find(
                  e =>
                    e.idUser ===
                    ids[indice]
                ) ?? {
                  idUser: ids[indice],
                  name: '',
                  surnames: ''
                };

              const valores =
                notas.map(
                  n =>
                    Number(
                      n.gradeValue
                    )
                );

              const promedio =
                valores.length
                  ? valores.reduce(
                      (a, b) =>
                        a + b,
                      0
                    ) /
                    valores.length
                  : 0;

              return {
                estudiante,
                notas,
                promedio
              };
            }
          );
      }
    });
  }

  regenerarVistaPrevia(): void {
    if (this.esDirectivo) {
      return;
    }

    if (
      this.esEstudiante &&
      this.idEstudianteActual
    ) {
      this.seleccionadosReporte.clear();
      this.seleccionadosReporte.add(
        this.idEstudianteActual
      );
    }

    if (
      !this.esEstudiante &&
      !this.seleccionadosReporte.size
    ) {
      this.errorReporte =
        'Selecciona al menos un estudiante.';
      return;
    }

    this.errorReporte = '';
    this.cargandoVistaPrevia = true;

    this.cargarPromediosReportes();

    setTimeout(() => {
      this.vistaPreviaGenerada = true;
      this.cargandoVistaPrevia = false;
    }, 300);
  }

  seleccionarEstudianteReporte(
    idStudent: number
  ): void {
    if (this.esDirectivo) {
      return;
    }

    if (
      this.seleccionadosReporte.has(
        idStudent
      )
    ) {
      this.seleccionadosReporte.delete(
        idStudent
      );
    } else {
      this.seleccionadosReporte.add(
        idStudent
      );
    }

    this.todosSeleccionadosReporte =
      this.estudiantesReporte.length > 0 &&
      this.estudiantesReporte.every(
        e =>
          this.seleccionadosReporte.has(
            e.idUser
          )
      );
  }

  toggleEstudianteReporte(
    idStudent: number
  ): void {
    this.seleccionarEstudianteReporte(
      idStudent
    );
  }

  seleccionarTodosReportes(
    seleccionado: boolean
  ): void {
    if (this.esDirectivo) {
      return;
    }

    if (seleccionado) {
      this.estudiantesReporte.forEach(
        e =>
          this.seleccionadosReporte.add(
            e.idUser
          )
      );
    } else {
      this.seleccionadosReporte.clear();
    }

    this.todosSeleccionadosReporte =
      seleccionado;
  }

  toggleTodosReporte(): void {
    this.seleccionarTodosReportes(
      !this.todosSeleccionadosReporte
    );
  }

  descargarReportePdf(): void {
    if (
      this.esDirectivo ||
      this.idPeriodoReporte === null
    ) {
      return;
    }

    if (this.esEstudiante) {
      if (!this.idEstudianteActual) {
        return;
      }

      this.descargarPdfEstudiante(
        this.idEstudianteActual
      );
      return;
    }

    if (
      this.idCursoReporte === null
    ) {
      return;
    }

    this.descargarPdfCurso(
      this.idCursoReporte
    );
  }

  descargarPdfEstudiante(
    idStudent: number
  ): void {
    if (
      this.esDirectivo ||
      this.idPeriodoReporte === null
    ) {
      return;
    }

    this.descargandoPdf = true;

    this.notasService
      .descargarPdfEstudiante(
        idStudent,
        this.idPeriodoReporte
      )
      .pipe(
        finalize(() => {
          this.descargandoPdf = false;
        })
      )
      .subscribe({
        next: blob =>
          this.abrirPdf(blob),
        error: () => {
          this.errorReporte =
            'No fue posible generar el PDF.';
        }
      });
  }

  descargarPdfCurso(
    idCurso?: number
  ): void {
    if (
      this.esDirectivo ||
      this.idPeriodoSeleccionado === null
    ) {
      return;
    }

    const curso =
      idCurso ??
      this.idCursoSeleccionado;

    if (
      curso === null ||
      this.idAsignaturaNotas === null
    ) {
      this.errorPdfCurso =
        'Selecciona un curso y una asignatura.';
      return;
    }

    this.descargandoPdfCurso = true;
    this.errorPdfCurso = '';

    this.notasService
      .descargarPdfCurso(
        curso,
        this.idAsignaturaNotas,
        this.idPeriodoSeleccionado
      )
      .pipe(
        finalize(() => {
          this.descargandoPdfCurso = false;
        })
      )
      .subscribe({
        next: blob =>
          this.abrirPdf(blob),
        error: () => {
          this.errorPdfCurso =
            'No fue posible generar el PDF del curso.';
        }
      });
  }

  abrirPdf(blob: Blob): void {
    const url =
      window.URL.createObjectURL(blob);

    window.open(
      url,
      '_blank'
    );

    setTimeout(() => {
      window.URL.revokeObjectURL(
        url
      );
    }, 10000);
  }

  configurarEscala(): void {
    if (!this.escalas.length) {
      this.escalaActual = null;
      return;
    }

    this.escalaActual =
      this.obtenerEscalaActual();

    if (this.escalaActual) {
      this.formEscala = {
        ...this.escalaActual
      };
    }
  }

  editarEscala(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    this.editandoEscala = true;
  }

  cancelarEdicionEscala(): void {
    this.editandoEscala = false;
    this.configurarEscala();
  }

  guardarEscala(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    this.guardarCambiosCalificacion();
  }

  guardarCambiosCalificacion(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    this.errorEscala = '';

    if (
      this.formEscala.minimumValue >=
      this.formEscala.maximumValue
    ) {
      this.errorEscala =
        'El valor mínimo debe ser menor que el valor máximo.';
      return;
    }

    if (
      this.formEscala.minimumPassGrade <
        this.formEscala.minimumValue ||
      this.formEscala.minimumPassGrade >
        this.formEscala.maximumValue
    ) {
      this.errorEscala =
        'La meta de aprobación debe estar dentro del rango.';
      return;
    }

    this.guardandoEscala = true;

    const dto = {
      minimumValue:
        this.formEscala.minimumValue,
      maximumValue:
        this.formEscala.maximumValue,
      minimumPassGrade:
        this.formEscala.minimumPassGrade
    };

    const solicitud =
      this.formEscala.idScale
        ? this.notasService.actualizarEscala(
            this.formEscala.idScale,
            dto
          )
        : this.notasService.registrarEscala(
            dto
          );

    solicitud
      .pipe(
        finalize(() => {
          this.guardandoEscala =
            false;
        })
      )
      .subscribe({
        next: escala => {
          this.escalaActual = escala;

          const indice =
            this.escalas.findIndex(
              e =>
                e.idScale ===
                escala.idScale
            );

          if (indice >= 0) {
            this.escalas[indice] =
              escala;
          } else {
            this.escalas.push(
              escala
            );
          }

          this.formEscala = {
            ...escala
          };

          this.guardarPasos();
        },
        error: () => {
          this.errorEscala =
            'No fue posible guardar la escala.';
        }
      });
  }

  guardarNuevoTipo(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    if (
      !this.escalaActual ||
      !this.nuevoTipo.letterGrade ||
      this.nuevoTipo.numericGrade === null
    ) {
      this.errorTipo =
        'Completa los datos del tipo de calificación.';
      return;
    }

    this.guardandoTipo = true;
    this.errorTipo = '';

    this.notasService
      .registrarTipoEvaluacion({
        idScale:
          this.escalaActual.idScale,
        numericGrade:
          this.nuevoTipo.numericGrade,
        letterGrade:
          this.nuevoTipo.letterGrade
      })
      .pipe(
        finalize(() => {
          this.guardandoTipo =
            false;
        })
      )
      .subscribe({
        next: tipo => {
          this.tiposEvaluacion.push(
            tipo
          );

          this.nuevoTipo = {
            letterGrade: '',
            numericGrade: null
          };
        },
        error: () => {
          this.errorTipo =
            'No fue posible registrar el tipo de calificación.';
        }
      });
  }

  configurarPasosPeriodo(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    if (
      this.idPeriodoPasos === null &&
      this.idPeriodoSeleccionado !== null
    ) {
      this.idPeriodoPasos =
        this.idPeriodoSeleccionado;
    }

    if (this.idPeriodoPasos === null) {
      this.pasosPeriodo = [];
      this.totalPorcentajePasos = 0;
      return;
    }

    const actividades =
      this.actividadesEvaluativas.filter(
        a =>
          a.idPeriod ===
          this.idPeriodoPasos
      );

    this.pasosPeriodo =
      actividades.map(a => ({
        idEvaluative:
          a.idEvaluative,
        evaluationName:
          a.evaluationName,
        weightPercentage:
          a.weightPercentage,
        startDate:
          a.startDate,
        endDate:
          a.endDate,
        existente: true
      }));

    this.pasosYaDefinidos =
      actividades.length > 0;

    this.recalcularPorcentajes();
  }

  onCambioPeriodoPasos(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    this.configurarPasosPeriodo();
  }

  agregarPaso(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    const numero =
      this.pasosPeriodo.length + 1;

    this.pasosPeriodo.push({
      evaluationName:
        `Actividad ${numero}`,
      weightPercentage: 0,
      startDate:
        this.obtenerFechaActual(),
      endDate:
        this.obtenerFechaActual(),
      existente: false
    });

    this.recalcularPorcentajes();
  }

  eliminarPaso(
    paso: PasoPeriodo
  ): void {
    if (
      this.esEstudiante ||
      this.esDirectivo ||
      paso.existente
    ) {
      return;
    }

    const indice =
      this.pasosPeriodo.indexOf(
        paso
      );

    if (indice >= 0) {
      this.pasosPeriodo.splice(
        indice,
        1
      );
    }

    this.recalcularPorcentajes();
  }

  ajustarPaso(
    paso: PasoPeriodo,
    cantidad: number
  ): void {
    if (
      this.esEstudiante ||
      this.esDirectivo ||
      paso.existente
    ) {
      return;
    }

    paso.weightPercentage =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            paso.weightPercentage
          ) + cantidad
        )
      );

    this.recalcularPorcentajes();
  }

  recalcularPorcentajes(): void {
    this.totalPorcentajePasos =
      Math.round(
        this.pasosPeriodo.reduce(
          (total, paso) =>
            total +
            Number(
              paso.weightPercentage
            ),
          0
        ) * 100
      ) / 100;
  }

  guardarPasos(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    if (
      this.idPeriodoPasos === null
    ) {
      return;
    }

    this.recalcularPorcentajes();

    if (
      this.totalPorcentajePasos !==
      100
    ) {
      this.errorPasos =
        'Los porcentajes deben sumar exactamente 100%.';
      return;
    }

    const nuevos =
      this.pasosPeriodo.filter(
        paso =>
          !paso.existente
      );

    if (!nuevos.length) {
      return;
    }

    this.guardandoPasos = true;
    this.errorPasos = '';

    const solicitudes =
      nuevos.map(paso =>
        this.notasService.registrarActividadEvaluativa(
          {
            idPeriod:
              this.idPeriodoPasos!,
            startDate:
              paso.startDate,
            endDate:
              paso.endDate,
            evaluationName:
              paso.evaluationName,
            weightPercentage:
              paso.weightPercentage
          }
        )
      );

    forkJoin(solicitudes)
      .pipe(
        finalize(() => {
          this.guardandoPasos =
            false;
        })
      )
      .subscribe({
        next: actividades => {
          this.actividadesEvaluativas =
            [
              ...this.actividadesEvaluativas,
              ...actividades
            ];

          this.configurarPasosPeriodo();
        },
        error: () => {
          this.errorPasos =
            'No fue posible guardar las actividades evaluativas.';
        }
      });
  }

  recargarActividades(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    this.notasService
      .listarActividadesEvaluativas()
      .subscribe({
        next: actividades => {
          this.actividadesEvaluativas =
            actividades;

          this.configurarPasosPeriodo();
        }
      });
  }

  descartarPasos(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    this.configurarPasosPeriodo();
  }

  agregarActividadEvaluativa(): void {
    this.agregarPaso();
  }

  descartarCambiosCalificacion(): void {
    if (
      this.esEstudiante ||
      this.esDirectivo
    ) {
      return;
    }

    this.configurarEscala();
    this.configurarPasosPeriodo();
  }

  obtenerNombreCurso(
    idCurso: number | null
  ): string {
    if (idCurso === null) {
      return 'Sin curso';
    }

    return (
      this.cursos.find(
        c =>
          c.idCourse ===
          idCurso
      )?.name ??
      'Sin curso'
    );
  }

  obtenerNombreAsignatura(
    idAsignatura: number | null
  ): string {
    if (idAsignatura === null) {
      return 'Sin asignatura';
    }

    return (
      this.asignaturas.find(
        a =>
          a.idSubject ===
          idAsignatura
      )?.name ??
      'Sin asignatura'
    );
  }

  obtenerNombrePeriodo(
    idPeriodo: number | null
  ): string {
    if (idPeriodo === null) {
      return 'Sin periodo';
    }

    return (
      this.periodos.find(
        p =>
          p.idPeriod ===
          idPeriodo
      )?.name ??
      'Sin periodo'
    );
  }

  obtenerNombreActividad(
    idEvaluative: number
  ): string {
    return (
      this.actividadesEvaluativas.find(
        a =>
          a.idEvaluative ===
          idEvaluative
      )?.evaluationName ??
      'Actividad'
    );
  }

  obtenerClaseEstado(
    valor: number
  ): string {
    if (!this.escalaActual) {
      return '';
    }

    return valor >=
      this.escalaActual.minimumPassGrade
      ? 'aprobado'
      : 'reprobado';
  }

  puedeEditarNotas(): boolean {
    return this.esDocente;
  }

  puedeExportar(): boolean {
    return !this.esDirectivo;
  }

  puedeConfigurarCalificacion(): boolean {
    return (
      !this.esEstudiante &&
      !this.esDirectivo
    );
  }

  obtenerRolTexto(): string {
    if (this.esAdministrador) {
      return 'Administrador';
    }

    if (this.esDocente) {
      return 'Docente';
    }

    if (this.esEstudiante) {
      return 'Estudiante';
    }

    if (this.esDirectivo) {
      return 'Directivo';
    }

    return 'Usuario';
  }

  redondear(
    valor: number
  ): number {
    return Math.round(
      valor * 100
    ) / 100;
  }

  validarNota(
    valor: number
  ): boolean {
    if (!this.escalaActual) {
      return valor >= 0 && valor <= 5;
    }

    return (
      valor >=
        this.escalaActual.minimumValue &&
      valor <=
        this.escalaActual.maximumValue
    );
  }

  obtenerFechaActual(): string {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  get actividadesPeriodo(): EvaluativeActivityResponseDTO[] {
    return this.obtenerActividadesDelPeriodo();
  }

  get nombrePeriodoActual(): string {
    return this.obtenerNombrePeriodo(
      this.idPeriodoSeleccionado
    );
  }

  get nombreCursoActual(): string {
    return this.obtenerNombreCurso(
      this.idCursoSeleccionado
    );
  }

  get nombreAsignaturaActual(): string {
    return this.obtenerNombreAsignatura(
      this.idAsignaturaSeleccionada
    );
  }

  get hayEstudiantesSeleccionados(): boolean {
    return this.seleccionadosReporte.size > 0;
  }

  get todosLosEstudiantesSeleccionados(): boolean {
    return this.todosSeleccionadosReporte;
  }

  get porcentajePasos(): number {
    return this.totalPorcentajePasos;
  }

  get porcentajePasosValido(): boolean {
    return this.totalPorcentajePasos === 100;
  }

  get hayEscala(): boolean {
    return this.escalaActual !== null;
  }

  get puedeEditarCalificacion(): boolean {
    return (
      !this.esEstudiante &&
      !this.esDirectivo &&
      (
        this.esDocente ||
        this.esAdministrador
      )
    );
  }

  get puedeDescargarPdf(): boolean {
    return !this.esDirectivo;
  }

  get maximoEscala(): number {
    return this.escalaActual?.maximumValue ?? 5;
  }

  get tiposDeLaEscala(): EvaluationTypeResponseDTO[] {
    if (!this.escalaActual) {
      return [];
    }

    return this.tiposEvaluacion.filter(
      tipo =>
        tipo.idScale ===
        this.escalaActual!.idScale
    );
  }

  get perfilActual(): MiPerfilDTO | null {
    return this.perfil;
  }

  get nombreNivelReporte(): string {
    return (
      this.niveles.find(
        n =>
          n.idLevel ===
          this.idNivelReporte
      )?.name ??
      'Sin nivel'
    );
  }

  get nombreCursoReporte(): string {
    return (
      this.cursos.find(
        c =>
          c.idCourse ===
          this.idCursoReporte
      )?.name ??
      'Sin curso'
    );
  }

  get nombrePeriodoReporte(): string {
    return this.obtenerNombrePeriodo(
      this.idPeriodoReporte
    );
  }
}