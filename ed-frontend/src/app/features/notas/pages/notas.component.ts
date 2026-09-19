import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, from } from 'rxjs';
import {
  catchError,
  map,
  concatMap,
  tap,
  delay
} from 'rxjs/operators';
import {
  NotasService,
  AcademicLevelResponseDTO,
  CourseResponseDTO,
  AcademicPeriodResponseDTO,
  SubjectResponseDTO,
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

type Tab =
  | 'historial'
  | 'reportes'
  | 'notas'
  | 'calificacion';

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

  perfilActual: MiPerfilDTO | null = null;

  esEstudiante = false;
  esDocente = false;
  esAdministrador = false;

  idEstudianteActual: number | null = null;
  idCursoEstudiante: number | null = null;

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

  nuevoTipo = {
    letterGrade: '',
    numericGrade: null as number | null
  };

  guardandoTipo = false;
  errorTipo: string | null = null;

  idPeriodoPasos: number | null = null;

  pasosPeriodo: PasoPeriodo[] = [];
  pasosYaDefinidos = false;

  guardandoPasos = false;
  errorPasos: string | null = null;

  constructor(
    private notasService: NotasService,
    private perfilService: PerfilService
  ) {}

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
      actividades: this.notasService.listarActividadesEvaluativas(),
      perfil: this.perfilService.obtenerMiPerfil().pipe(
        catchError(() => of(null))
      )
    }).subscribe({
      next: ({
        niveles,
        cursos,
        periodos,
        asignaturas,
        escalas,
        tipos,
        actividades,
        perfil
      }) => {
        this.perfilActual = perfil?.data ?? null;

        this.configurarRol();

        this.niveles = niveles;
        this.cursos = cursos.filter(c => c.status);
        this.periodos = periodos;
        this.asignaturas = asignaturas;

        this.escalaActual = escalas.length
          ? escalas[escalas.length - 1]
          : null;

        this.tiposEvaluacion = tipos;
        this.actividadesEvaluativas = actividades;

        if (this.escalaActual) {
          this.formEscala = {
            minimumValue: this.escalaActual.minimumValue,
            maximumValue: this.escalaActual.maximumValue,
            minimumPassGrade: this.escalaActual.minimumPassGrade
          };
        }

        if (this.esEstudiante) {
          if (this.idCursoEstudiante !== null) {
            this.idCursoSeleccionado = this.idCursoEstudiante;
          } else {
            this.errorBase =
              'No se encontró el curso asignado a tu usuario.';
            this.cargandoBase = false;
            return;
          }
        } else {
          if (this.cursos.length) {
            this.idCursoSeleccionado = this.cursos[0].idCourse;
          }
        }

        const periodoActivo = this.periodos.find(
          p => p.status
        );

        this.idPeriodoSeleccionado =
          (
            periodoActivo ??
            this.periodos[0]
          )?.idPeriod ?? null;

        this.idPeriodoPasos =
          this.idPeriodoSeleccionado;

        this.idPeriodoReporte =
          this.idPeriodoSeleccionado;

        if (this.asignaturas.length) {
          this.idAsignaturaNotas =
            this.asignaturas[0].idSubject;
        }

        if (this.esEstudiante) {
          this.configurarDatosEstudiante();
          this.cargarAsignaturasEstudiante();
        }

        this.cargandoBase = false;

        this.cargarHistorial();
        this.actualizarPasosPeriodo();

        if (this.esEstudiante) {
          this.configurarReporteEstudiante();
        }
      },
      error: () => {
        this.errorBase =
          'No se pudo cargar la información base del módulo de notas.';
        this.cargandoBase = false;
      }
    });
  }

  private configurarRol(): void {
    const rol = (
      this.perfilActual?.roleName ?? ''
    )
      .trim()
      .toUpperCase();

    this.esEstudiante =
      rol === 'ESTUDIANTE';

    this.esDocente =
      rol === 'DOCENTE';

    this.esAdministrador =
      rol === 'ADMINISTRADOR' ||
      rol === 'ADMIN';

    if (this.perfilActual) {
      this.idEstudianteActual =
        this.perfilActual.idUser;

      this.idCursoEstudiante =
        this.perfilActual.idCourse ?? null;
    }
  }

  private configurarDatosEstudiante(): void {
    if (!this.perfilActual) {
      return;
    }

    this.idEstudianteActual =
      this.perfilActual.idUser;

    this.idCursoEstudiante =
      this.perfilActual.idCourse ?? null;

    if (this.idCursoEstudiante !== null) {
      this.idCursoSeleccionado =
        this.idCursoEstudiante;
    }
  }

  private cargarAsignaturasEstudiante(): void {
    if (
      !this.esEstudiante ||
      this.idCursoEstudiante === null
    ) {
      return;
    }

    this.notasService
      .listarCargaPorCurso(
        this.idCursoEstudiante
      )
      .subscribe({
        next: cargas => {
          const idsAsignaturas =
            Array.from(
              new Set(
                cargas
                  .filter(c => c.status !== false)
                  .map(c => c.idSubject)
              )
            );

          this.asignaturas =
            this.asignaturas.filter(
              asignatura =>
                idsAsignaturas.includes(
                  asignatura.idSubject
                )
            );

          if (
            this.asignaturas.length &&
            (
              this.idAsignaturaNotas === null ||
              !this.asignaturas.some(
                a =>
                  a.idSubject ===
                  this.idAsignaturaNotas
              )
            )
          ) {
            this.idAsignaturaNotas =
              this.asignaturas[0].idSubject;
          }

          if (this.tabActiva === 'notas') {
            this.notasConsultadas = false;
            this.cargarNotas();
          }
        },
        error: () => {
          this.errorBase =
            'No se pudieron cargar las asignaturas de tu curso.';
        }
      });
  }

  cambiarTab(tab: Tab): void {
    this.tabActiva = tab;

    if (
      tab === 'historial' &&
      !this.historialConsultado
    ) {
      this.cargarHistorial();
    }

    if (
      tab === 'notas' &&
      !this.notasConsultadas
    ) {
      this.cargarNotas();
    }

    if (
      tab === 'reportes' &&
      this.esEstudiante
    ) {
      this.configurarReporteEstudiante();
    }
  }

  get cursoSeleccionadoNombre(): string {
    return this.cursos.find(
      c =>
        c.idCourse ===
        this.idCursoSeleccionado
    )?.name ??
      'Selecciona un curso';
  }

  get nombreNivelReporte(): string {
    if (this.idNivelReporte === null) {
      return '';
    }

    return this.niveles.find(
      nivel =>
        nivel.idLevel ===
        this.idNivelReporte
    )?.name ?? '';
  }

  onCambioCursoGlobal(): void {
    if (this.esEstudiante) {
      this.idCursoSeleccionado =
        this.idCursoEstudiante;
      return;
    }

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
    this.historialConsultado = false;
    this.notasConsultadas = false;
    this.celdas.clear();

    if (this.esEstudiante) {
      this.cargarHistorial();

      if (this.tabActiva === 'notas') {
        this.cargarNotas();
      }

      if (this.tabActiva === 'reportes') {
        this.configurarReporteEstudiante();
      }

      return;
    }

    this.onCambioCursoGlobal();
  }

  cargarHistorial(): void {
    if (
      this.idCursoSeleccionado === null ||
      this.idPeriodoSeleccionado === null
    ) {
      return;
    }

    this.cargandoHistorial = true;
    this.errorHistorial = null;
    this.historialConsultado = true;

    const idCurso =
      this.idCursoSeleccionado;

    const idPeriodo =
      this.idPeriodoSeleccionado;

    const nombreCurso =
      this.cursoSeleccionadoNombre;

    if (this.esEstudiante) {
      this.cargarHistorialEstudiante(
        idCurso,
        idPeriodo
      );
      return;
    }

    this.notasService
      .listarCargaPorCurso(idCurso)
      .subscribe({
        next: cargas => {
          const idsAsignaturas =
            Array.from(
              new Set(
                cargas
                  .filter(c => c.status !== false)
                  .map(c => c.idSubject)
              )
            );

          if (!idsAsignaturas.length) {
            this.resumenAsignaturas = [];
            this.promedioGeneral = 0;
            this.cargandoHistorial = false;
            return;
          }

          const llamadas =
            idsAsignaturas.map(
              idSubject =>
                this.notasService
                  .obtenerNotasPorCurso(
                    idCurso,
                    idSubject,
                    idPeriodo
                  )
                  .pipe(
                    map(notas => ({
                      idSubject,
                      notas
                    })),
                    catchError(() =>
                      of({
                        idSubject,
                        notas:
                          [] as GradeDetailResponseDTO[]
                      })
                    )
                  )
            );

          forkJoin(llamadas)
            .subscribe({
              next: resultados => {
                this.calcularResumenAsignaturas(
                  resultados
                );

                this.cargandoHistorial = false;
              },
              error: () => {
                this.errorHistorial =
                  `No se pudo cargar el historial de notas del curso ${nombreCurso}.`;

                this.cargandoHistorial = false;
              }
            });
        },
        error: () => {
          this.errorHistorial =
            `No se pudo cargar la información académica del curso ${nombreCurso}.`;

          this.cargandoHistorial = false;
        }
      });
  }

  private cargarHistorialEstudiante(
    idCurso: number,
    idPeriodo: number
  ): void {
    if (
      this.idEstudianteActual === null
    ) {
      this.errorHistorial =
        'No se pudo identificar al estudiante.';

      this.cargandoHistorial = false;
      return;
    }

    this.notasService
      .listarCargaPorCurso(idCurso)
      .subscribe({
        next: cargas => {
          const idsAsignaturas =
            Array.from(
              new Set(
                cargas
                  .filter(c => c.status !== false)
                  .map(c => c.idSubject)
              )
            );

          if (!idsAsignaturas.length) {
            this.resumenAsignaturas = [];
            this.promedioGeneral = 0;
            this.cargandoHistorial = false;
            return;
          }

          this.notasService
            .obtenerNotasPorEstudiante(
              this.idEstudianteActual!,
              idPeriodo
            )
            .subscribe({
              next: notas => {
                const notasDelCurso =
                  notas.filter(
                    nota =>
                      Number(nota.idCourse) ===
                      Number(idCurso)
                  );

                const resultados =
                  idsAsignaturas.map(
                    idSubject => ({
                      idSubject,
                      notas:
                        notasDelCurso.filter(
                          nota =>
                            Number(
                              nota.idSubject
                            ) ===
                            Number(idSubject)
                        )
                    })
                  );

                this.calcularResumenAsignaturas(
                  resultados
                );

                this.cargandoHistorial = false;
              },
              error: () => {
                this.errorHistorial =
                  'No se pudieron cargar tus notas para el periodo seleccionado.';

                this.cargandoHistorial = false;
              }
            });
        },
        error: () => {
          this.errorHistorial =
            'No se pudieron cargar las asignaturas de tu curso.';

          this.cargandoHistorial = false;
        }
      });
  }

  private calcularResumenAsignaturas(
    resultados: {
      idSubject: number;
      notas: GradeDetailResponseDTO[];
    }[]
  ): void {
    const maximo =
      this.escalaActual?.maximumValue ?? 5;

    this.resumenAsignaturas =
      resultados.map(
        ({ idSubject, notas }) => {
          const nombre =
            this.asignaturas.find(
              a =>
                a.idSubject === idSubject
            )?.name ??
            notas[0]?.subjectName ??
            `Asignatura ${idSubject}`;

          const promedio =
            notas.length
              ? Math.round(
                  (
                    notas.reduce(
                      (acc, nota) =>
                        acc +
                        Number(
                          nota.gradeValue
                        ),
                      0
                    ) /
                    notas.length
                  ) * 100
                ) / 100
              : 0;

          return {
            idSubject,
            nombre,
            promedio,
            porcentaje:
              maximo > 0
                ? Math.min(
                    100,
                    Math.round(
                      (promedio / maximo) *
                      100
                    )
                  )
                : 0,
            totalNotas:
              notas.length
          };
        }
      );

    const conNotas =
      this.resumenAsignaturas.filter(
        r =>
          r.totalNotas > 0
      );

    this.promedioGeneral =
      conNotas.length
        ? Math.round(
            (
              conNotas.reduce(
                (acc, r) =>
                  acc + r.promedio,
                0
              ) /
              conNotas.length
            ) * 100
          ) / 100
        : 0;
  }

  get maximoEscala(): number {
    return (
      this.escalaActual?.maximumValue ??
      5
    );
  }

  onCambioNivelReporte(): void {
    if (this.esEstudiante) {
      this.configurarReporteEstudiante();
      return;
    }

    this.idCursoReporte = null;
    this.estudiantesReporte = [];
    this.seleccionadosReporte.clear();
    this.vistaPreviaGenerada = false;
    this.vistaPrevia = [];

    if (
      this.idNivelReporte === null
    ) {
      this.cursosReporte = [];
      return;
    }

    this.notasService
      .listarCursosPorNivel(
        this.idNivelReporte
      )
      .subscribe({
        next: cursos => {
          this.cursosReporte =
            cursos.filter(
              c => c.status
            );

          if (
            this.cursosReporte.length
          ) {
            this.idCursoReporte =
              this.cursosReporte[0].idCourse;

            this.onCambioCursoReporte();
          }
        },
        error: () => {
          this.cursosReporte = [];
        }
      });
  }

  private configurarReporteEstudiante(): void {
    if (
      !this.esEstudiante ||
      this.idEstudianteActual === null ||
      this.idCursoEstudiante === null
    ) {
      return;
    }

    this.idCursoReporte =
      this.idCursoEstudiante;

    this.idPeriodoReporte =
      this.idPeriodoSeleccionado;

    const curso =
      this.cursos.find(
        c =>
          c.idCourse ===
          this.idCursoEstudiante
      );

    this.idNivelReporte =
      curso?.idLevel ?? null;

    const estudiante =
      this.crearUsuarioBasicoDesdePerfil();

    if (estudiante) {
      this.estudiantesReporte =
        [estudiante];

      this.seleccionadosReporte.clear();

      this.seleccionadosReporte.add(
        estudiante.idUser
      );
    }

    this.cursosReporte =
      curso
        ? [curso]
        : [];

    this.vistaPreviaGenerada = false;
    this.vistaPrevia = [];
    this.errorReporte = null;
  }

  private crearUsuarioBasicoDesdePerfil():
    UsuarioBasico | null {
    if (!this.perfilActual) {
      return null;
    }

    return {
      idUser:
        this.perfilActual.idUser,
      name:
        this.perfilActual.name,
      surnames:
        this.perfilActual.surnames,
      status:
        this.perfilActual.status,
      idRole:
        this.perfilActual.idRole,
      roleName:
        this.perfilActual.roleName,
      idCourse:
        this.perfilActual.idCourse
    };
  }

  onCambioCursoReporte(): void {
    if (this.esEstudiante) {
      this.configurarReporteEstudiante();
      return;
    }

    this.estudiantesReporte = [];
    this.seleccionadosReporte.clear();
    this.vistaPreviaGenerada = false;
    this.vistaPrevia = [];

    if (
      this.idCursoReporte === null
    ) {
      return;
    }

    this.cargandoEstudiantesReporte = true;
    this.errorReporte = null;

    const nombreCurso =
      this.nombreCursoReporte ||
      'seleccionado';

    this.notasService
      .listarEstudiantesPorCurso(
        this.idCursoReporte
      )
      .subscribe({
        next: estudiantes => {
          this.estudiantesReporte =
            estudiantes
              .filter(
                e =>
                  e.status !== false
              );

          this.cargandoEstudiantesReporte =
            false;
        },
        error: () => {
          this.errorReporte =
            `No se pudo cargar el listado de estudiantes del curso ${nombreCurso}.`;

          this.cargandoEstudiantesReporte =
            false;
        }
      });
  }

  toggleEstudianteReporte(
    idUser: number
  ): void {
    if (this.esEstudiante) {
      return;
    }

    if (
      this.seleccionadosReporte.has(
        idUser
      )
    ) {
      this.seleccionadosReporte.delete(
        idUser
      );
    } else {
      this.seleccionadosReporte.add(
        idUser
      );
    }
  }

  get todosSeleccionadosReporte(): boolean {
    return (
      this.estudiantesReporte.length > 0 &&
      this.estudiantesReporte.every(
        e =>
          this.seleccionadosReporte.has(
            e.idUser
          )
      )
    );
  }

  toggleTodosReporte(): void {
    if (this.esEstudiante) {
      return;
    }

    if (
      this.todosSeleccionadosReporte
    ) {
      this.seleccionadosReporte.clear();
    } else {
      this.estudiantesReporte.forEach(
        e =>
          this.seleccionadosReporte.add(
            e.idUser
          )
      );
    }
  }

  regenerarVistaPrevia(): void {
    if (this.esEstudiante) {
      this.configurarReporteEstudiante();
    }

    if (
      !this.seleccionadosReporte.size ||
      this.idPeriodoReporte === null
    ) {
      this.errorReporte =
        'Selecciona un periodo.';

      return;
    }

    this.cargandoVistaPrevia = true;
    this.errorReporte = null;

    const idPeriodo =
      this.idPeriodoReporte;

    const llamadas =
      Array.from(
        this.seleccionadosReporte
      ).map(idStudent => {
        const estudiante =
          this.estudiantesReporte.find(
            e =>
              e.idUser === idStudent
          );

        if (!estudiante) {
          return of({
            estudiante:
              this.crearUsuarioBasicoDesdePerfil()!,
            notas:
              [] as GradeDetailResponseDTO[],
            promedio: 0
          });
        }

        return this.notasService
          .obtenerNotasPorEstudiante(
            idStudent,
            idPeriodo
          )
          .pipe(
            map(notas => {
              const promedio =
                notas.length
                  ? Math.round(
                      (
                        notas.reduce(
                          (acc, n) =>
                            acc +
                            Number(
                              n.gradeValue
                            ),
                          0
                        ) /
                        notas.length
                      ) * 100
                    ) / 100
                  : 0;

              return {
                estudiante,
                notas,
                promedio
              };
            }),
            catchError(() =>
              of({
                estudiante,
                notas:
                  [] as GradeDetailResponseDTO[],
                promedio: 0
              })
            )
          );
      });

    forkJoin(llamadas)
      .subscribe({
        next: resultados => {
          this.vistaPrevia =
            resultados;

          this.vistaPreviaGenerada =
            true;

          this.cargandoVistaPrevia =
            false;
        },
        error: () => {
          this.errorReporte =
            'No se pudo generar la vista previa del reporte.';

          this.cargandoVistaPrevia =
            false;
        }
      });
  }

  get nombreCursoReporte(): string {
    return this.cursosReporte.find(
      c =>
        c.idCourse ===
        this.idCursoReporte
    )?.name ?? '';
  }

  get nombrePeriodoReporte(): string {
    return this.periodos.find(
      p =>
        p.idPeriod ===
        this.idPeriodoReporte
    )?.name ?? '';
  }

  descargarReportePdf(): void {
    if (this.esEstudiante) {
      this.configurarReporteEstudiante();
    }

    if (
      !this.vistaPreviaGenerada ||
      this.idPeriodoReporte === null ||
      !this.seleccionadosReporte.size
    ) {
      return;
    }

    const idPeriodo =
      this.idPeriodoReporte;

    const ids =
      Array.from(
        this.seleccionadosReporte
      );

    this.descargandoPdf = true;
    this.errorReporte = null;

    from(ids)
      .pipe(
        concatMap(idStudent =>
          this.notasService
            .descargarPdfEstudiante(
              idStudent,
              idPeriodo
            )
            .pipe(
              tap(blob => {
                const estudiante =
                  this.estudiantesReporte.find(
                    e =>
                      e.idUser ===
                      idStudent
                  );

                const nombreArchivo =
                  estudiante
                    ? `notas_${estudiante.name}_${estudiante.surnames}_periodo_${idPeriodo}.pdf`
                        .replace(
                          /\s+/g,
                          '_'
                        )
                    : `notas_estudiante_${idStudent}_periodo_${idPeriodo}.pdf`;

                this.descargarBlob(
                  blob,
                  nombreArchivo
                );
              }),
              catchError(() => {
                this.errorReporte =
                  'No se pudo generar el PDF de uno o más estudiantes.';

                return of(null);
              }),
              delay(250)
            )
        )
      )
      .subscribe({
        complete: () => {
          this.descargandoPdf =
            false;
        }
      });
  }

  descargarPdfCurso(): void {
    if (this.esEstudiante) {
      if (
        this.idEstudianteActual === null ||
        this.idPeriodoSeleccionado === null
      ) {
        return;
      }

      this.descargandoPdfCurso = true;
      this.errorPdfCurso = null;

      this.notasService
        .descargarPdfEstudiante(
          this.idEstudianteActual,
          this.idPeriodoSeleccionado
        )
        .subscribe({
          next: blob => {
            const nombreArchivo =
              `mis_notas_${this.nombrePeriodoReporte || this.idPeriodoSeleccionado}.pdf`
                .replace(
                  /\s+/g,
                  '_'
                );

            this.descargarBlob(
              blob,
              nombreArchivo
            );

            this.descargandoPdfCurso =
              false;
          },
          error: () => {
            this.errorPdfCurso =
              'No se pudo generar tu reporte de notas.';

            this.descargandoPdfCurso =
              false;
          }
        });

      return;
    }

    if (
      this.idCursoSeleccionado === null ||
      this.idAsignaturaNotas === null ||
      this.idPeriodoSeleccionado === null
    ) {
      return;
    }

    this.descargandoPdfCurso = true;
    this.errorPdfCurso = null;

    const idCurso =
      this.idCursoSeleccionado;

    const idSubject =
      this.idAsignaturaNotas;

    const idPeriodo =
      this.idPeriodoSeleccionado;

    const nombreCurso =
      this.cursoSeleccionadoNombre;

    const nombreAsignatura =
      this.asignaturas.find(
        a =>
          a.idSubject ===
          idSubject
      )?.name ??
      `asignatura_${idSubject}`;

    const nombreArchivo =
      `notas_${nombreCurso}_${nombreAsignatura}_periodo_${idPeriodo}.pdf`
        .replace(
          /\s+/g,
          '_'
        );

    this.notasService
      .descargarPdfCurso(
        idCurso,
        idSubject,
        idPeriodo
      )
      .subscribe({
        next: blob => {
          this.descargarBlob(
            blob,
            nombreArchivo
          );

          this.descargandoPdfCurso =
            false;
        },
        error: () => {
          this.errorPdfCurso =
            `No se pudo generar el PDF del curso ${nombreCurso}.`;

          this.descargandoPdfCurso =
            false;
        }
      });
  }

  private descargarBlob(
    blob: Blob,
    nombreArchivo: string
  ): void {
    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;
    a.download =
      nombreArchivo;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  cargarNotas(): void {
    if (
      this.idCursoSeleccionado === null ||
      this.idPeriodoSeleccionado === null
    ) {
      return;
    }

    if (this.esEstudiante) {
      this.cargarNotasEstudiante();
      return;
    }

    if (
      this.idAsignaturaNotas === null
    ) {
      return;
    }

    this.cargandoNotas = true;
    this.errorNotas = null;
    this.notasConsultadas = true;
    this.celdas.clear();

    const idCurso =
      this.idCursoSeleccionado;

    const idSubject =
      this.idAsignaturaNotas;

    const idPeriodo =
      this.idPeriodoSeleccionado;

    const nombreCurso =
      this.cursoSeleccionadoNombre;

    this.actividadesNotasColumnas =
      this.actividadesEvaluativas.filter(
        a =>
          a.idPeriod === idPeriodo &&
          a.isActive
      );

    if (
      !this.actividadesNotasColumnas.length
    ) {
      this.errorNotas =
        'No hay actividades evaluativas configuradas para este periodo. Ve a la pestaña "Calificación" y define los pasos del periodo.';
    }

    forkJoin({
      estudiantes:
        this.notasService
          .listarEstudiantesPorCurso(
            idCurso
          ),

      cargas:
        this.notasService
          .listarCargaPorCurso(
            idCurso
          ),

      notas:
        this.notasService
          .obtenerNotasPorCurso(
            idCurso,
            idSubject,
            idPeriodo
          )
    }).subscribe({
      next: ({
        estudiantes,
        cargas,
        notas
      }) => {
        this.estudiantesNotas =
          estudiantes
            .filter(
              e =>
                e.status !== false
            )
            .map(e => ({
              estudiante: e,
              nombreCompleto:
                `${e.name} ${e.surnames}`.trim()
            }))
            .sort(
              (a, b) =>
                a.nombreCompleto
                  .localeCompare(
                    b.nombreCompleto
                  )
            );

        const carga =
          cargas.find(
            c =>
              c.idSubject ===
                idSubject &&
              c.status === true
          );

        const rolActual =
          (
            this.perfilActual?.roleName ??
            ''
          )
            .trim()
            .toUpperCase();

        const idUsuarioActual =
          this.perfilActual?.idUser ??
          null;

        if (
          rolActual === 'DOCENTE' &&
          idUsuarioActual !== null
        ) {
          this.idTeacherAsignaturaActual =
            idUsuarioActual;
        } else if (
          carga?.idTeacher
        ) {
          this.idTeacherAsignaturaActual =
            carga.idTeacher;
        } else {
          this.idTeacherAsignaturaActual =
            null;
        }

        if (!carga) {
          this.errorNotas =
            (
              this.errorNotas
                ? this.errorNotas + ' '
                : ''
            ) +
            `No hay un docente asignado a esta asignatura en el curso ${nombreCurso} (carga académica).`;
        }

        if (
          rolActual !== 'DOCENTE'
        ) {
          this.errorNotas =
            (
              this.errorNotas
                ? this.errorNotas + ' '
                : ''
            ) +
            'El registro y edición de notas requiere una cuenta con rol Docente.';
        }

        this.estudiantesNotas
          .forEach(fila => {
            this.actividadesNotasColumnas
              .forEach(actividad => {
                const clave =
                  this.claveCelda(
                    fila.estudiante.idUser,
                    actividad.idEvaluative
                  );

                const notaExistente =
                  notas.find(
                    n =>
                      n.idStudent ===
                        fila.estudiante.idUser &&
                      n.idEvaluative ===
                        actividad.idEvaluative
                  );

                this.celdas.set(
                  clave,
                  {
                    valor:
                      notaExistente
                        ? String(
                            notaExistente.gradeValue
                          )
                        : '',
                    idGrade:
                      notaExistente?.idGrade ??
                      null,
                    guardando: false,
                    error: null
                  }
                );
              });
          });

        this.cargandoNotas = false;
      },
      error: err => {
        if (
          err?.status === 403
        ) {
          this.errorNotas =
            `No tienes permisos para ver los estudiantes del curso ${nombreCurso}. Contacta al administrador para que revise tu rol de acceso.`;
        } else {
          this.errorNotas =
            `No se pudo cargar el listado de estudiantes o las notas del curso ${nombreCurso}.`;
        }

        this.cargandoNotas = false;
      }
    });
  }

  private cargarNotasEstudiante(): void {
    if (
      this.idEstudianteActual === null ||
      this.idCursoEstudiante === null ||
      this.idPeriodoSeleccionado === null
    ) {
      this.errorNotas =
        'No se pudo identificar tu estudiante, curso o periodo.';

      this.cargandoNotas = false;
      return;
    }

    this.cargandoNotas = true;
    this.errorNotas = null;
    this.errorGuardado = null;
    this.notasConsultadas = true;
    this.celdas.clear();

    const idEstudiante =
      this.idEstudianteActual;

    const idPeriodo =
      this.idPeriodoSeleccionado;

    const idCurso =
      this.idCursoEstudiante;

    this.actividadesNotasColumnas =
      this.actividadesEvaluativas.filter(
        a =>
          a.idPeriod === idPeriodo &&
          a.isActive
      );

    this.notasService
      .listarCargaPorCurso(idCurso)
      .subscribe({
        next: cargas => {
          const idsAsignaturas =
            Array.from(
              new Set(
                cargas
                  .filter(
                    c =>
                      c.status !== false
                  )
                  .map(
                    c =>
                      c.idSubject
                  )
              )
            );

          this.asignaturas =
            this.asignaturas.filter(
              asignatura =>
                idsAsignaturas.includes(
                  asignatura.idSubject
                )
            );

          if (
            this.idAsignaturaNotas === null ||
            !this.asignaturas.some(
              a =>
                a.idSubject ===
                this.idAsignaturaNotas
            )
          ) {
            this.idAsignaturaNotas =
              this.asignaturas.length
                ? this.asignaturas[0].idSubject
                : null;
          }

          if (
            this.idAsignaturaNotas === null
          ) {
            this.estudiantesNotas = [];
            this.celdas.clear();

            this.errorNotas =
              'No tienes asignaturas asignadas en este curso.';

            this.cargandoNotas = false;
            return;
          }

          const estudiante =
            this.crearUsuarioBasicoDesdePerfil();

          if (!estudiante) {
            this.errorNotas =
              'No se pudo obtener la información del estudiante.';

            this.cargandoNotas = false;
            return;
          }

          this.estudiantesNotas = [
            {
              estudiante,
              nombreCompleto:
                `${estudiante.name} ${estudiante.surnames}`.trim()
            }
          ];

          this.notasService
            .obtenerNotasPorEstudiante(
              idEstudiante,
              idPeriodo
            )
            .subscribe({
              next: notas => {
                const notasMateria =
                  notas.filter(
                    nota =>
                      Number(
                        nota.idCourse
                      ) ===
                        Number(idCurso) &&
                      Number(
                        nota.idSubject
                      ) ===
                        Number(
                          this.idAsignaturaNotas
                        ) &&
                      Number(
                        nota.idPeriod
                      ) ===
                        Number(idPeriodo)
                  );

                const idsActividadesConNota =
                  new Set(
                    notasMateria.map(
                      nota =>
                        nota.idEvaluative
                    )
                  );

                if (
                  this.actividadesNotasColumnas
                    .length === 0
                ) {
                  this.actividadesNotasColumnas =
                    this.actividadesEvaluativas
                      .filter(
                        actividad =>
                          actividad.idPeriod ===
                            idPeriodo &&
                          idsActividadesConNota.has(
                            actividad.idEvaluative
                          )
                      );
                }

                this.actividadesNotasColumnas
                  .forEach(
                    actividad => {
                      const clave =
                        this.claveCelda(
                          idEstudiante,
                          actividad.idEvaluative
                        );

                      const notaExistente =
                        notasMateria.find(
                          nota =>
                            nota.idEvaluative ===
                            actividad.idEvaluative
                        );

                      this.celdas.set(
                        clave,
                        {
                          valor:
                            notaExistente
                              ? String(
                                  notaExistente.gradeValue
                                )
                              : '',
                          idGrade:
                            notaExistente?.idGrade ??
                            null,
                          guardando: false,
                          error: null
                        }
                      );
                    }
                  );

                this.cargandoNotas = false;
              },
              error: () => {
                this.errorNotas =
                  'No se pudieron cargar tus notas para el periodo seleccionado.';

                this.cargandoNotas = false;
              }
            });
        },
        error: () => {
          this.errorNotas =
            'No se pudieron cargar las asignaturas de tu curso.';

          this.cargandoNotas = false;
        }
      });
  }

  claveCelda(
    idStudent: number,
    idEvaluative: number
  ): string {
    return `${idStudent}_${idEvaluative}`;
  }

  obtenerCelda(
    idStudent: number,
    idEvaluative: number
  ): CeldaEstado {
    const clave =
      this.claveCelda(
        idStudent,
        idEvaluative
      );

    return (
      this.celdas.get(clave) ??
      {
        valor: '',
        idGrade: null,
        guardando: false,
        error: null
      }
    );
  }

  onCambioCelda(
    idStudent: number,
    idEvaluative: number,
    valor: string | number
  ): void {
    if (this.esEstudiante) {
      return;
    }

    const clave =
      this.claveCelda(
        idStudent,
        idEvaluative
      );

    const actual =
      this.celdas.get(clave) ??
      {
        valor: '',
        idGrade: null,
        guardando: false,
        error: null
      };

    this.celdas.set(
      clave,
      {
        ...actual,
        valor: String(
          valor ?? ''
        ),
        error: null
      }
    );

    this.errorGuardado = null;
  }

  guardarCelda(
    fila: FilaNotas,
    actividad: EvaluativeActivityResponseDTO
  ): void {
    if (this.esEstudiante) {
      return;
    }

    try {
      this.intentarGuardarCelda(
        fila,
        actividad
      );
    } catch {
      this.errorGuardado =
        'Ocurrió un error inesperado al intentar guardar la nota.';
    }
  }

  private intentarGuardarCelda(
    fila: FilaNotas,
    actividad: EvaluativeActivityResponseDTO
  ): void {
    if (this.esEstudiante) {
      return;
    }

    if (
      this.idCursoSeleccionado === null ||
      this.idAsignaturaNotas === null ||
      this.idPeriodoSeleccionado === null
    ) {
      return;
    }

    const clave =
      this.claveCelda(
        fila.estudiante.idUser,
        actividad.idEvaluative
      );

    const celda =
      this.celdas.get(clave);

    if (
      !celda ||
      String(celda.valor).trim() === ''
    ) {
      return;
    }

    const valorNumerico =
      Number(celda.valor);

    if (
      Number.isNaN(valorNumerico)
    ) {
      this.celdas.set(
        clave,
        {
          ...celda,
          error: 'Valor inválido'
        }
      );

      return;
    }

    if (
      this.escalaActual &&
      (
        valorNumerico <
          this.escalaActual.minimumValue ||
        valorNumerico >
          this.escalaActual.maximumValue
      )
    ) {
      this.celdas.set(
        clave,
        {
          ...celda,
          error:
            `Debe estar entre ${this.escalaActual.minimumValue} y ${this.escalaActual.maximumValue}`
        }
      );

      return;
    }

    const rolActual =
      (
        this.perfilActual?.roleName ??
        ''
      )
        .trim()
        .toUpperCase();

    if (
      rolActual !== 'DOCENTE' ||
      this.perfilActual?.idUser == null
    ) {
      this.celdas.set(
        clave,
        {
          ...celda,
          error: 'Sin permiso'
        }
      );

      this.errorGuardado =
        'Para registrar o editar notas debes iniciar sesión con una cuenta de Docente.';

      return;
    }

    const idTeacher =
      this.perfilActual.idUser;

    this.idTeacherAsignaturaActual =
      idTeacher;

    const tipo =
      this.encontrarTipoEvaluacion(
        valorNumerico
      );

    if (!tipo) {
      this.celdas.set(
        clave,
        {
          ...celda,
          error:
            'Configura los tipos de calificación en "Calificación"'
        }
      );

      return;
    }

    this.celdas.set(
      clave,
      {
        ...celda,
        guardando: true,
        error: null
      }
    );

    this.errorGuardado = null;

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
        valorNumerico
    };

    const peticion =
      celda.idGrade
        ? this.notasService.actualizarNota(
            celda.idGrade,
            dto
          )
        : this.notasService.registrarNota(
            dto
          );

    peticion.subscribe({
      next: resultado => {
        this.celdas.set(
          clave,
          {
            valor:
              String(
                resultado.gradeValue
              ),
            idGrade:
              resultado.idGrade,
            guardando: false,
            error: null
          }
        );
      },
      error: err => {
        const mensaje =
          err?.error?.message ??
          err?.error?.error ??
          'No se pudo guardar la nota';

        if (
          err?.status === 401 ||
          err?.status === 403
        ) {
          this.celdas.set(
            clave,
            {
              ...celda,
              guardando: false,
              error: 'Sin permiso'
            }
          );

          this.errorGuardado =
            'No tienes permisos para registrar notas con tu rol actual.';
        } else {
          this.celdas.set(
            clave,
            {
              ...celda,
              guardando: false,
              error: 'No se pudo guardar'
            }
          );

          this.errorGuardado =
            mensaje;
        }
      }
    });
  }

  private encontrarTipoEvaluacion(
    valor: number
  ): EvaluationTypeResponseDTO | null {
    if (!this.escalaActual) {
      return null;
    }

    const candidatos =
      this.tiposEvaluacion.filter(
        t =>
          t.idScale ===
            this.escalaActual!.idScale &&
          t.numericGrade !== null &&
          t.numericGrade !== undefined
      );

    if (!candidatos.length) {
      return null;
    }

    return candidatos.reduce(
      (mejor, actual) =>
        Math.abs(
          Number(
            actual.numericGrade
          ) - valor
        ) <
        Math.abs(
          Number(
            mejor.numericGrade
          ) - valor
        )
          ? actual
          : mejor
    );
  }

  guardarEscala(): void {
    if (this.esEstudiante) {
      return;
    }

    if (
      this.formEscala.minimumValue >=
      this.formEscala.maximumValue
    ) {
      this.errorEscala =
        'El valor mínimo debe ser menor que el máximo.';

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
    this.errorEscala = null;

    const dto = {
      ...this.formEscala
    };

    const peticion =
      this.escalaActual
        ? this.notasService.actualizarEscala(
            this.escalaActual.idScale,
            dto
          )
        : this.notasService.registrarEscala(
            dto
          );

    peticion.subscribe({
      next: escala => {
        this.escalaActual =
          escala;

        this.guardandoEscala =
          false;

        this.formEscala = {
          minimumValue:
            escala.minimumValue,
          maximumValue:
            escala.maximumValue,
          minimumPassGrade:
            escala.minimumPassGrade
        };

        alert(
          'Los cambios en la escala de calificación se guardaron correctamente.'
        );
      },
      error: err => {
        this.errorEscala =
          err?.error?.message ??
          'No se pudo guardar la escala de calificación.';

        this.guardandoEscala =
          false;

        alert(
          'No se pudo guardar la escala de calificación. Revisa los datos e intenta de nuevo.'
        );
      }
    });
  }

  guardarCambiosCalificacion(): void {
    if (this.esEstudiante) {
      return;
    }

    this.guardarEscala();

    if (!this.pasosYaDefinidos) {
      this.guardarPasos();
    }
  }

  descartarCambiosCalificacion(): void {
    if (this.esEstudiante) {
      return;
    }

    this.descartarEscala();
    this.descartarPasos();
  }

  descartarEscala(): void {
    if (this.escalaActual) {
      this.formEscala = {
        minimumValue:
          this.escalaActual.minimumValue,

        maximumValue:
          this.escalaActual.maximumValue,

        minimumPassGrade:
          this.escalaActual.minimumPassGrade
      };
    }

    this.errorEscala = null;
  }

  get tiposDeLaEscala():
    EvaluationTypeResponseDTO[] {
    if (!this.escalaActual) {
      return [];
    }

    return this.tiposEvaluacion.filter(
      t =>
        t.idScale ===
        this.escalaActual!.idScale
    );
  }

  guardarNuevoTipo(): void {
    if (this.esEstudiante) {
      return;
    }

    if (!this.escalaActual) {
      this.errorTipo =
        'Primero guarda la escala de calificación.';

      return;
    }

    if (
      !this.nuevoTipo.letterGrade.trim() ||
      this.nuevoTipo.numericGrade === null
    ) {
      this.errorTipo =
        'Indica un nombre y un valor numérico de referencia.';

      return;
    }

    this.guardandoTipo = true;
    this.errorTipo = null;

    this.notasService
      .registrarTipoEvaluacion({
        idScale:
          this.escalaActual.idScale,

        letterGrade:
          this.nuevoTipo.letterGrade.trim(),

        numericGrade:
          this.nuevoTipo.numericGrade
      })
      .subscribe({
        next: tipo => {
          this.tiposEvaluacion = [
            ...this.tiposEvaluacion,
            tipo
          ];

          this.nuevoTipo = {
            letterGrade: '',
            numericGrade: null
          };

          this.guardandoTipo = false;
        },
        error: err => {
          this.errorTipo =
            err?.error?.message ??
            'No se pudo registrar el tipo de calificación.';

          this.guardandoTipo = false;
        }
      });
  }

  onCambioPeriodoPasos(): void {
    if (this.esEstudiante) {
      return;
    }

    this.actualizarPasosPeriodo();
  }

  private actualizarPasosPeriodo(): void {
    const existentes =
      this.actividadesEvaluativas.filter(
        a =>
          a.idPeriod ===
          this.idPeriodoPasos
      );

    if (existentes.length) {
      this.pasosYaDefinidos = true;

      this.pasosPeriodo =
        existentes.map(
          a => ({
            idEvaluative:
              a.idEvaluative,

            evaluationName:
              a.evaluationName,

            weightPercentage:
              a.weightPercentage,

            existente: true
          })
        );
    } else {
      this.pasosYaDefinidos = false;

      this.pasosPeriodo = [
        {
          idEvaluative: null,
          evaluationName: 'Actividades',
          weightPercentage: 30,
          existente: false
        },
        {
          idEvaluative: null,
          evaluationName: 'Evaluación',
          weightPercentage: 50,
          existente: false
        },
        {
          idEvaluative: null,
          evaluationName: 'Examen final',
          weightPercentage: 20,
          existente: false
        }
      ];
    }

    this.errorPasos = null;
  }

  ajustarPaso(
    paso: PasoPeriodo,
    delta: number
  ): void {
    if (
      this.esEstudiante ||
      paso.existente
    ) {
      return;
    }

    const nuevo =
      paso.weightPercentage +
      delta;

    paso.weightPercentage =
      Math.min(
        100,
        Math.max(
          0,
          nuevo
        )
      );
  }

  get totalPorcentajePasos(): number {
    return this.pasosPeriodo.reduce(
      (acc, p) =>
        acc +
        Number(
          p.weightPercentage || 0
        ),
      0
    );
  }

  descartarPasos(): void {
    if (this.esEstudiante) {
      return;
    }

    this.actualizarPasosPeriodo();
  }

  guardarPasos(): void {
    if (this.esEstudiante) {
      return;
    }

    if (this.pasosYaDefinidos) {
      return;
    }

    if (
      this.idPeriodoPasos === null
    ) {
      this.errorPasos =
        'Selecciona un periodo.';

      return;
    }

    if (
      this.totalPorcentajePasos !==
      100
    ) {
      this.errorPasos =
        'La suma de los pasos debe ser exactamente 100%.';

      return;
    }

    const periodo =
      this.periodos.find(
        p =>
          p.idPeriod ===
          this.idPeriodoPasos
      );

    if (!periodo) {
      this.errorPasos =
        'Periodo no encontrado.';

      return;
    }

    this.guardandoPasos = true;
    this.errorPasos = null;

    const llamadas =
      this.pasosPeriodo.map(
        paso =>
          this.notasService
            .registrarActividadEvaluativa({
              idPeriod:
                periodo.idPeriod,

              startDate:
                periodo.startDate,

              endDate:
                periodo.endDate,

              evaluationName:
                paso.evaluationName,

              weightPercentage:
                paso.weightPercentage
            })
      );

    forkJoin(llamadas)
      .subscribe({
        next: creadas => {
          this.actividadesEvaluativas = [
            ...this.actividadesEvaluativas,
            ...creadas
          ];

          this.guardandoPasos = false;

          this.actualizarPasosPeriodo();

          alert(
            'Los pasos del periodo se guardaron correctamente.'
          );
        },
        error: err => {
          this.errorPasos =
            err?.error?.message ??
            'No se pudieron guardar los pasos del periodo.';

          this.guardandoPasos = false;

          alert(
            'No se pudieron guardar los pasos del periodo. Revisa que sumen 100% e intenta de nuevo.'
          );
        }
      });
  }
}