import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  AsistenciaService,
  AttendanceRequestDTO,
  AttendanceResponseDTO,
  AttendanceStatus,
  AcademicLevelResponseDTO,
  CourseResponseDTO,
  FilaGridListado,
  JustificationStatus,
  ResumenCurso,
  SesionResumen,
  UsuarioBasico
} from '../../services/Asistencia.service';

import { PerfilService } from '../../../admin/services/perfil.service';

type Tab =
  | 'resumen'
  | 'historial'
  | 'listado'
  | 'conflictos';

const PALETA_BARRAS = [
  '#7B2FF7',
  '#E75480',
  '#F0B429',
  '#17B897',
  '#8B7CF0',
  '#7ED321'
];

const ETIQUETA_ESTADO: Record<AttendanceStatus, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Falta',
  LATE: 'Tardanza',
  EARLY_DEPARTURE: 'Salida anticipada',
  JUSTIFIED: 'Justificado'
};

const ETIQUETA_JUSTIFICACION: Record<JustificationStatus, string> = {
  NONE: 'Sin justificar',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
};

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './asistencias.component.html',
  styleUrl: './asistencias.component.scss'
})
export class AsistenciaComponent implements OnInit {

  tabActiva: Tab = 'resumen';

  // ================= DATOS DE APOYO =================

  cursos: CourseResponseDTO[] = [];
  niveles: AcademicLevelResponseDTO[] = [];
  estudiantes: UsuarioBasico[] = [];
  docentes: UsuarioBasico[] = [];

  mapaEstudiantes = new Map<number, string>();
  mapaDocentes = new Map<number, string>();

  idAdminActual: number | null = null;

  cargandoBase = true;
  errorBase: string | null = null;

  // ================= RESUMEN =================

  fechaInicioSesiones = this.primerDiaMesISO();
  fechaFinSesiones = this.hoyISO();

  filtroSesionesCurso: number | null = null;

  sesiones: SesionResumen[] = [];

  cargandoSesiones = false;
  errorSesiones: string | null = null;
  sesionesConsultadas = false;

  // ================= HISTORIAL =================

  fechaInicioHistorial = this.primerDiaMesISO();
  fechaFinHistorial = this.hoyISO();

  idCursoSeleccionado: number | null = null;

  resumenPorCurso: ResumenCurso[] = [];

  cargandoHistorialGrafico = false;
  errorHistorialGrafico: string | null = null;

  // ================= LISTADO =================

  filtroListadoCurso: number | null = null;

  filtroListadoInicio = this.primerDiaMesISO();
  filtroListadoFin = this.hoyISO();

  columnasListado: string[] = [];
  filasListado: FilaGridListado[] = [];

  cargandoListado = false;
  errorListado: string | null = null;

  listadoConsultado = false;

  guardandoCelda: string | null = null;

  // ================= EXCUSAS =================

  filtroExcusasCurso: number | null = null;

  filtroExcusasInicio = this.primerDiaMesISO();
  filtroExcusasFin = this.hoyISO();

  excusas: AttendanceResponseDTO[] = [];

  cargandoExcusas = false;
  errorExcusas: string | null = null;

  excusasConsultadas = false;

  revisandoId: number | null = null;

  constructor(
    private asistenciaService: AsistenciaService,
    private perfilService: PerfilService
  ) {}

  ngOnInit(): void {

    this.cargandoBase = true;
    this.errorBase = null;

    forkJoin({
      cursos: this.asistenciaService.listarCursos(),

      niveles: this.asistenciaService.listarNiveles(),

      estudiantes:
        this.asistenciaService.listarEstudiantes(),

      docentes:
        this.asistenciaService.listarDocentes(),

      perfil:
        this.perfilService.obtenerMiPerfil().pipe(
          map(r => r.data),
          catchError(() => of(null))
        )
    }).subscribe({

      next: ({
        cursos,
        niveles,
        estudiantes,
        docentes,
        perfil
      }) => {

        this.cursos = cursos.filter(
          c => c.status
        );

        this.niveles = niveles;
        this.estudiantes = estudiantes;
        this.docentes = docentes;

        this.mapaEstudiantes = new Map(
          estudiantes.map(e => [
            e.idUser,
            `${e.name} ${e.surnames}`.trim()
          ])
        );

        this.mapaDocentes = new Map(
          docentes.map(d => [
            d.idUser,
            `${d.name} ${d.surnames}`.trim()
          ])
        );

        this.idAdminActual =
          perfil?.idUser ?? null;

        if (this.cursos.length > 0) {

          const primerCurso =
            this.cursos[0].idCourse;

          this.idCursoSeleccionado =
            primerCurso;

          this.filtroListadoCurso =
            primerCurso;

          this.filtroExcusasCurso =
            primerCurso;
        }

        this.cargandoBase = false;

        this.buscarSesiones();
      },

      error: () => {

        this.errorBase =
          'No se pudo cargar la información base (cursos, niveles, docentes o estudiantes).';

        this.cargandoBase = false;
      }
    });
  }

  // ================= NAVEGACIÓN =================

  cambiarTab(tab: Tab): void {

    this.tabActiva = tab;

    if (
      tab === 'historial' &&
      !this.resumenPorCurso.length
    ) {
      this.cargarGraficoHistorial();
    }

    if (
      tab === 'listado' &&
      !this.listadoConsultado
    ) {
      this.buscarListado();
    }

    if (
      tab === 'conflictos' &&
      !this.excusasConsultadas
    ) {
      this.buscarExcusas();
    }
  }

  // ================= RESUMEN =================

  buscarSesiones(): void {

    this.cargandoSesiones = true;
    this.errorSesiones = null;
    this.sesionesConsultadas = true;

    if (
      !this.fechaInicioSesiones ||
      !this.fechaFinSesiones
    ) {
      this.sesiones = [];
      this.errorSesiones =
        'Selecciona las fechas de inicio y fin.';
      this.cargandoSesiones = false;
      return;
    }

    if (
      this.fechaInicioSesiones >
      this.fechaFinSesiones
    ) {
      this.sesiones = [];
      this.errorSesiones =
        'La fecha inicial no puede ser posterior a la fecha final.';
      this.cargandoSesiones = false;
      return;
    }

    const cursosAConsultar =
      this.filtroSesionesCurso !== null
        ? this.cursos.filter(
            c =>
              c.idCourse ===
              this.filtroSesionesCurso
          )
        : this.cursos;

    if (!cursosAConsultar.length) {

      this.sesiones = [];
      this.cargandoSesiones = false;
      return;
    }

    const llamadas =
      cursosAConsultar.map(curso =>
        this.asistenciaService
          .obtenerHistorialPorCurso(
            curso.idCourse,
            this.fechaInicioSesiones,
            this.fechaFinSesiones
          )
          .pipe(
            map(registros => ({
              curso,
              registros
            })),
            catchError(() =>
              of({
                curso,
                registros:
                  [] as AttendanceResponseDTO[]
              })
            )
          )
      );

    forkJoin(llamadas).subscribe({

      next: resultados => {

        const sesiones: SesionResumen[] = [];

        resultados.forEach(
          ({ curso, registros }) => {

            const porFecha =
              new Map<
                string,
                AttendanceResponseDTO[]
              >();

            registros.forEach(registro => {

              const lista =
                porFecha.get(
                  registro.attendanceDate
                ) ?? [];

              lista.push(registro);

              porFecha.set(
                registro.attendanceDate,
                lista
              );
            });

            porFecha.forEach(
              (lista, fecha) => {

                sesiones.push({
                  idCourse: curso.idCourse,

                  nombreCurso: curso.name,

                  docente:
                    curso.homeroomTeacher != null
                      ? (
                          this.mapaDocentes.get(
                            curso.homeroomTeacher
                          ) ?? '—'
                        )
                      : '—',

                  fecha,

                  presentes:
                    lista.filter(
                      r =>
                        r.attendanceStatus ===
                          'PRESENT' ||
                        r.attendanceStatus ===
                          'JUSTIFIED'
                    ).length,

                  ausentes:
                    lista.filter(
                      r =>
                        r.attendanceStatus ===
                        'ABSENT'
                    ).length,

                  tardanzas:
                    lista.filter(
                      r =>
                        r.attendanceStatus ===
                        'LATE'
                    ).length
                });
              }
            );
          }
        );

        this.sesiones =
          sesiones.sort(
            (a, b) =>
              b.fecha.localeCompare(a.fecha)
          );

        this.cargandoSesiones = false;
      },

      error: () => {

        this.errorSesiones =
          'No se pudo cargar el resumen de sesiones.';

        this.cargandoSesiones = false;
      }
    });
  }

  verSesion(sesion: SesionResumen): void {

    this.filtroListadoCurso =
      sesion.idCourse;

    this.filtroListadoInicio =
      sesion.fecha;

    this.filtroListadoFin =
      sesion.fecha;

    this.listadoConsultado = false;

    this.cambiarTab('listado');
  }

  // ================= HISTORIAL =================

  cargarGraficoHistorial(): void {

    if (!this.cursos.length) {

      this.resumenPorCurso = [];
      return;
    }

    if (
      !this.fechaInicioHistorial ||
      !this.fechaFinHistorial
    ) {
      this.errorHistorialGrafico =
        'Selecciona las fechas del historial.';
      return;
    }

    if (
      this.fechaInicioHistorial >
      this.fechaFinHistorial
    ) {
      this.errorHistorialGrafico =
        'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    this.cargandoHistorialGrafico = true;
    this.errorHistorialGrafico = null;

    const llamadas =
      this.cursos.map(curso =>
        this.asistenciaService
          .obtenerHistorialPorCurso(
            curso.idCourse,
            this.fechaInicioHistorial,
            this.fechaFinHistorial
          )
          .pipe(

            map(registros => {

              const calculo =
                this.asistenciaService.calcularResumen(
                  registros
                );

              const nivel =
                this.niveles.find(
                  n =>
                    n.idLevel ===
                    curso.idLevel
                );

              const resumen: ResumenCurso = {

                idCourse:
                  curso.idCourse,

                nombreCurso:
                  curso.name,

                nombreNivel:
                  nivel?.name ?? '',

                ...calculo
              };

              return resumen;
            }),

            catchError(() =>
              of(null)
            )
          )
      );

    forkJoin(llamadas).subscribe({

      next: resultados => {

        this.resumenPorCurso =
          resultados.filter(
            (
              r
            ): r is ResumenCurso =>
              r !== null
          );

        if (
          this.idCursoSeleccionado ===
            null ||
          !this.resumenPorCurso.some(
            r =>
              r.idCourse ===
              this.idCursoSeleccionado
          )
        ) {
          this.idCursoSeleccionado =
            this.resumenPorCurso[0]
              ?.idCourse ?? null;
        }

        this.cargandoHistorialGrafico =
          false;
      },

      error: () => {

        this.errorHistorialGrafico =
          'No se pudo cargar el historial de asistencia.';

        this.cargandoHistorialGrafico =
          false;
      }
    });
  }

  get resumenSeleccionado():
    ResumenCurso | null {

    return (
      this.resumenPorCurso.find(
        r =>
          r.idCourse ===
          this.idCursoSeleccionado
      ) ?? null
    );
  }

  get promedioGlobal(): number {

    if (!this.resumenPorCurso.length) {
      return 0;
    }

    const suma =
      this.resumenPorCurso.reduce(
        (acc, r) =>
          acc + r.porcentajeAsistencia,
        0
      );

    return Math.round(
      (suma /
        this.resumenPorCurso.length) *
        100
    ) / 100;
  }

  get totalTardanzasGlobal(): number {

    return this.resumenPorCurso.reduce(
      (acc, r) =>
        acc + r.lateCount,
      0
    );
  }

  get totalFaltasGlobal(): number {

    return this.resumenPorCurso.reduce(
      (acc, r) =>
        acc + r.unjustifiedCount,
      0
    );
  }

  get porcentajeJustificadoGlobal(): number {

    const total =
      this.resumenPorCurso.reduce(
        (acc, r) =>
          acc + r.totalRecords,
        0
      );

    const justificadas =
      this.resumenPorCurso.reduce(
        (acc, r) =>
          acc + r.justifiedCount,
        0
      );

    return total === 0
      ? 0
      : Math.round(
          (justificadas * 100 /
            total) *
            100
        ) / 100;
  }

  get porcentajeNoJustificadoGlobal(): number {

    const total =
      this.resumenPorCurso.reduce(
        (acc, r) =>
          acc + r.totalRecords,
        0
      );

    const noJustificadas =
      this.resumenPorCurso.reduce(
        (acc, r) =>
          acc + r.unjustifiedCount,
        0
      );

    return total === 0
      ? 0
      : Math.round(
          (noJustificadas * 100 /
            total) *
            100
        ) / 100;
  }

  colorBarra(index: number): string {

    return PALETA_BARRAS[
      index % PALETA_BARRAS.length
    ];
  }

  get barras():
    {
      nombre: string;
      porcentaje: number;
      color: string;
    }[] {

    return this.resumenPorCurso.map(
      (r, i) => ({
        nombre: r.nombreCurso,
        porcentaje:
          r.porcentajeAsistencia,
        color: this.colorBarra(i)
      })
    );
  }

  readonly radioDonaGrande = 45;
  readonly radioDonaPequena = 40;

  readonly circunferenciaGrande =
    2 *
    Math.PI *
    this.radioDonaGrande;

  readonly circunferenciaPequena =
    2 *
    Math.PI *
    this.radioDonaPequena;

  dashOffset(
    porcentaje: number,
    circunferencia: number
  ): number {

    const pct =
      Math.max(
        0,
        Math.min(
          100,
          porcentaje ?? 0
        )
      );

    return (
      circunferencia -
      (pct / 100) *
        circunferencia
    );
  }

  get porcentajeTotal(): number {
    return this.promedioGlobal;
  }

  get totalTardanzas(): number {
    return this.totalTardanzasGlobal;
  }

  get totalFaltas(): number {
    return this.totalFaltasGlobal;
  }

  get porcentajeJustificadas(): number {
    return this.porcentajeJustificadoGlobal;
  }

  get porcentajeNoJustificadas(): number {
    return this.porcentajeNoJustificadoGlobal;
  }

  seleccionarCurso(
    idCourse: number
  ): void {

    this.idCursoSeleccionado =
      idCourse;
  }

  descargarPdfHistorial(): void {

    if (
      this.idCursoSeleccionado ===
      null
    ) {
      return;
    }

    this.descargar(
      this.asistenciaService.descargarPdf({
        course:
          this.idCursoSeleccionado,
        startDate:
          this.fechaInicioHistorial,
        endDate:
          this.fechaFinHistorial
      }),
      `asistencia-historial-curso-${this.idCursoSeleccionado}.pdf`
    );
  }

  // ================= LISTADO =================

  buscarListado(): void {

    this.errorListado = null;

    // Limpiar los resultados anteriores
    // antes de realizar una nueva consulta.
    this.columnasListado = [];
    this.filasListado = [];

    if (
      this.filtroListadoCurso ===
      null
    ) {

      this.listadoConsultado = true;
      this.errorListado =
        'Selecciona un curso.';
      return;
    }

    if (
      !this.filtroListadoInicio ||
      !this.filtroListadoFin
    ) {

      this.listadoConsultado = true;
      this.errorListado =
        'Selecciona las fechas de inicio y fin.';
      return;
    }

    if (
      this.filtroListadoInicio >
      this.filtroListadoFin
    ) {

      this.listadoConsultado = true;
      this.errorListado =
        'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    this.cargandoListado = true;
    this.listadoConsultado = true;

    this.asistenciaService
      .obtenerHistorialPorCurso(
        this.filtroListadoCurso,
        this.filtroListadoInicio,
        this.filtroListadoFin
      )
      .subscribe({

        next: registros => {

          // El servicio convierte 404 en [].
          // Por eso aquí un [] significa
          // simplemente "sin registros".
          this.construirGrid(
            registros ?? []
          );

          this.cargandoListado = false;
        },

        error: (error) => {

          this.columnasListado = [];
          this.filasListado = [];

          if (error?.status === 404) {

            this.errorListado = null;

          } else {

            this.errorListado =
              'No se pudo cargar el listado de asistencia.';
          }

          this.cargandoListado = false;
        }
      });
  }

  private construirGrid(
    registros: AttendanceResponseDTO[]
  ): void {

    if (!registros.length) {

      this.columnasListado = [];
      this.filasListado = [];
      return;
    }

    const fechas =
      Array.from(
        new Set(
          registros
            .map(
              r =>
                r.attendanceDate
            )
            .filter(Boolean)
        )
      ).sort();

    this.columnasListado =
      fechas;

    const porEstudiante =
      new Map<
        number,
        Map<
          string,
          AttendanceResponseDTO
        >
      >();

    registros.forEach(registro => {

      const mapaFechas =
        porEstudiante.get(
          registro.idStudent
        ) ??
        new Map<
          string,
          AttendanceResponseDTO
        >();

      mapaFechas.set(
        registro.attendanceDate,
        registro
      );

      porEstudiante.set(
        registro.idStudent,
        mapaFechas
      );
    });

    const filas:
      FilaGridListado[] = [];

    porEstudiante.forEach(
      (mapaFechas, idStudent) => {

        const usuario =
          this.estudiantes.find(
            e =>
              e.idUser ===
              idStudent
          );

        const nombreCompleto =
          this.mapaEstudiantes.get(
            idStudent
          ) ??
          `Estudiante ${idStudent}`;

        const nombre =
          usuario?.name ??
          nombreCompleto;

        const apellidos =
          usuario?.surnames ??
          '';

        const partesNombre =
          nombre
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        const partesApellido =
          apellidos
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        const porFecha =
          new Map<
            string,
            AttendanceResponseDTO | null
          >();

        fechas.forEach(fecha => {

          porFecha.set(
            fecha,
            mapaFechas.get(
              fecha
            ) ?? null
          );
        });

        filas.push({

          idStudent,

          primerNombre:
            partesNombre[0] ?? '',

          segundoNombre:
            partesNombre.slice(1).join(' '),

          primerApellido:
            partesApellido[0] ?? '',

          segundoApellido:
            partesApellido
              .slice(1)
              .join(' '),

          porFecha
        });
      }
    );

    this.filasListado =
      filas.sort(
        (a, b) => {

          const nombreA =
            `${a.primerNombre} ${a.primerApellido}`;

          const nombreB =
            `${b.primerNombre} ${b.primerApellido}`;

          return nombreA.localeCompare(
            nombreB
          );
        }
      );
  }

  alternarCelda(
    fila: FilaGridListado,
    fecha: string
  ): void {

    const registro =
      fila.porFecha.get(
        fecha
      );

    if (!registro) {
      return;
    }

    const claveCelda =
      `${fila.idStudent}-${fecha}`;

    const nuevoEstado:
      AttendanceStatus =
        registro.attendanceStatus ===
        'PRESENT'
          ? 'ABSENT'
          : 'PRESENT';

    const dto:
      AttendanceRequestDTO = {

      idSchedule:
        registro.idSchedule,

      idStudent:
        registro.idStudent,

      idCourse:
        registro.idCourse,

      attendanceDate:
        registro.attendanceDate,

      attendanceStatus:
        nuevoEstado,

      observation:
        registro.observation ??
        undefined
    };

    this.guardandoCelda =
      claveCelda;

    this.asistenciaService
      .actualizarAsistencia(
        registro.idAttendance,
        dto
      )
      .subscribe({

        next: actualizado => {

          fila.porFecha.set(
            fecha,
            actualizado
          );

          this.guardandoCelda =
            null;
        },

        error: () => {

          this.errorListado =
            'No se pudo actualizar ese registro.';

          this.guardandoCelda =
            null;
        }
      });
  }

  descargarPdfListado(): void {

    if (
      this.filtroListadoCurso ===
      null
    ) {
      return;
    }

    this.descargar(
      this.asistenciaService.descargarPdf({
        course:
          this.filtroListadoCurso,
        startDate:
          this.filtroListadoInicio,
        endDate:
          this.filtroListadoFin
      }),
      `asistencia-listado-curso-${this.filtroListadoCurso}.pdf`
    );
  }

  // ================= EXCUSAS =================

  buscarExcusas(): void {

    this.cargandoExcusas = true;
    this.errorExcusas = null;
    this.excusasConsultadas = true;

    if (
      !this.filtroExcusasInicio ||
      !this.filtroExcusasFin
    ) {

      this.excusas = [];

      this.errorExcusas =
        'Selecciona las fechas de inicio y fin.';

      this.cargandoExcusas = false;
      return;
    }

    if (
      this.filtroExcusasInicio >
      this.filtroExcusasFin
    ) {

      this.excusas = [];

      this.errorExcusas =
        'La fecha inicial no puede ser posterior a la fecha final.';

      this.cargandoExcusas = false;
      return;
    }

    const cursosAConsultar =
      this.filtroExcusasCurso !== null
        ? this.cursos.filter(
            c =>
              c.idCourse ===
              this.filtroExcusasCurso
          )
        : this.cursos;

    if (!cursosAConsultar.length) {

      this.excusas = [];
      this.cargandoExcusas = false;
      return;
    }

    const llamadas =
      cursosAConsultar.map(curso =>
        this.asistenciaService
          .obtenerHistorialPorCurso(
            curso.idCourse,
            this.filtroExcusasInicio,
            this.filtroExcusasFin
          )
          .pipe(
            catchError(() =>
              of(
                [] as AttendanceResponseDTO[]
              )
            )
          )
      );

    forkJoin(llamadas).subscribe({

      next: resultados => {

        this.excusas =
          resultados
            .flat()
            .filter(
              r =>
                r.justificationStatus !==
                'NONE'
            )
            .sort(
              (a, b) =>
                b.attendanceDate.localeCompare(
                  a.attendanceDate
                )
            );

        this.cargandoExcusas =
          false;
      },

      error: () => {

        this.errorExcusas =
          'No se pudieron cargar las justificaciones.';

        this.cargandoExcusas =
          false;
      }
    });
  }

  revisarJustificacion(
    registro: AttendanceResponseDTO,
    aprobar: boolean
  ): void {

    if (
      this.idAdminActual ===
      null
    ) {

      this.errorExcusas =
        'No se pudo identificar al administrador que revisa.';

      return;
    }

    this.revisandoId =
      registro.idAttendance;

    this.asistenciaService
      .revisarJustificacion(
        registro.idAttendance,
        aprobar,
        this.idAdminActual
      )
      .subscribe({

        next: actualizado => {

          const idx =
            this.excusas.findIndex(
              r =>
                r.idAttendance ===
                actualizado.idAttendance
            );

          if (idx !== -1) {

            this.excusas[idx] =
              actualizado;
          }

          this.revisandoId =
            null;
        },

        error: () => {

          this.errorExcusas =
            'No se pudo registrar la revisión de la justificación.';

          this.revisandoId =
            null;
        }
      });
  }

  // ================= HELPERS =================

  nombreCurso(
    idCourse: number | null
  ): string {

    if (idCourse === null) {
      return '';
    }

    return (
      this.cursos.find(
        c =>
          c.idCourse ===
          idCourse
      )?.name ??
      `Curso ${idCourse}`
    );
  }

  nombreEstudiante(
    idStudent: number
  ): string {

    return (
      this.mapaEstudiantes.get(
        idStudent
      ) ??
      `Estudiante ${idStudent}`
    );
  }

  etiquetaEstado(
    estado: AttendanceStatus
  ): string {

    return ETIQUETA_ESTADO[
      estado
    ];
  }

  etiquetaJustificacion(
    estado: JustificationStatus
  ): string {

    return ETIQUETA_JUSTIFICACION[
      estado
    ];
  }

  claseEstado(
    estado: AttendanceStatus
  ): string {

    return (
      'badge-' +
      estado
        .toLowerCase()
        .replace(/_/g, '-')
    );
  }

  claseJustificacion(
    estado: JustificationStatus
  ): string {

    return (
      'estado-just-' +
      estado.toLowerCase()
    );
  }

  private descargar(
    obs: ReturnType<
      AsistenciaService['descargarPdf']
    >,
    nombreArchivo: string
  ): void {

    obs.subscribe({

      next: blob => {

        const url =
          window.URL.createObjectURL(
            blob
          );

        const a =
          document.createElement(
            'a'
          );

        a.href = url;
        a.download =
          nombreArchivo;

        a.click();

        window.URL.revokeObjectURL(
          url
        );
      },

      error: () => {

        this.errorHistorialGrafico =
          'No se pudo generar el PDF.';
      }
    });
  }

  private hoyISO(): string {

    const d = new Date();

    return [
      d.getFullYear(),
      String(
        d.getMonth() + 1
      ).padStart(2, '0'),
      String(
        d.getDate()
      ).padStart(2, '0')
    ].join('-');
  }

  private primerDiaMesISO(): string {

    const d = new Date();

    return [
      d.getFullYear(),
      String(
        d.getMonth() + 1
      ).padStart(2, '0'),
      '01'
    ].join('-');
  }
}
