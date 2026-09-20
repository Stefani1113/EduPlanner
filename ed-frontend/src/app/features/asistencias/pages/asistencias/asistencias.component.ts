import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, from, Observable } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import {
  AsistenciaService,
  AttendanceRequestDTO,
  AttendanceResponseDTO,
  AttendanceStatus,
  AttendanceSummaryDTO,
  AcademicLevelResponseDTO,
  CourseResponseDTO,
  FilaGridListado,
  JustificationStatus,
  ResumenCurso,
  SesionResumen,
  UsuarioBasico
} from '../../services/Asistencia.service';
import { PerfilService } from '../../../admin/services/perfil.service';
import { BreadcrumbService } from '../../../admin/services/breadcrumb.service';

type Tab =
  | 'tomar'
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

const ETIQUETA_TAB: Record<Tab, string> = {
  tomar: 'Tomar asistencia',
  resumen: 'Resumen',
  historial: 'Historial',
  listado: 'Listado',
  conflictos: 'Justificaciones'
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
export class AsistenciaComponent implements OnInit, OnDestroy {

  private readonly ID_SCHEDULE_ASISTENCIA = 1;

  tabActiva: Tab = 'tomar';

  // --- Perfil / rol ---
  esDirectivo = false;
  esDocente = false;
  esEstudiante = false;
  esAdministrador = false;
  idUsuarioActual: number | null = null;
  nombreUsuarioActual = '';
  idCursoEstudiante: number | null = null;

  get tabPorDefecto(): Tab {
    if (this.esEstudiante) return 'resumen';
    if (this.esDirectivo) return 'listado';
    return 'tomar';
  }

  tomaCurso: number | null = null;
  tomaFecha = this.hoyISO();

  tomaFilas: {
    idStudent: number;
    nombre: string;
    idAttendance: number | null;
    estado: AttendanceStatus;
  }[] = [];

  cargandoToma = false;
  errorToma: string | null = null;
  guardandoToma = false;
  errorGuardarToma: string | null = null;
  exitoGuardarToma = false;

  cursos: CourseResponseDTO[] = [];
  niveles: AcademicLevelResponseDTO[] = [];
  estudiantes: UsuarioBasico[] = [];
  docentes: UsuarioBasico[] = [];
  mapaEstudiantes = new Map<number, string>();
  mapaDocentes = new Map<number, string>();
  idAdminActual: number | null = null;
  cargandoBase = true;
  errorBase: string | null = null;

  fechaInicioSesiones = this.primerDiaMesISO();
  fechaFinSesiones = this.hoyISO();
  filtroSesionesCurso: number | null = null;
  sesiones: SesionResumen[] = [];
  cargandoSesiones = false;
  errorSesiones: string | null = null;
  sesionesConsultadas = false;
  busquedaSesiones = '';

  // --- Resumen personal (solo Estudiante) ---
  misRegistros: AttendanceResponseDTO[] = [];
  miResumenPersonal: AttendanceSummaryDTO | null = null;
  cargandoMiResumen = false;
  errorMiResumen: string | null = null;
  miResumenConsultado = false;

  fechaInicioHistorial = this.primerDiaMesISO();
  fechaFinHistorial = this.hoyISO();
  idCursoSeleccionado: number | null = null;
  resumenPorCurso: ResumenCurso[] = [];
  cargandoHistorialGrafico = false;
  errorHistorialGrafico: string | null = null;

  filtroListadoCurso: number | null = null;
  filtroListadoInicio = this.primerDiaMesISO();
  filtroListadoFin = this.hoyISO();
  columnasListado: string[] = [];
  filasListado: FilaGridListado[] = [];
  cargandoListado = false;
  errorListado: string | null = null;
  listadoConsultado = false;
  guardandoCelda: string | null = null;
  busquedaListado = '';

  filtroExcusasCurso: number | null = null;
  filtroExcusasInicio = this.primerDiaMesISO();
  filtroExcusasFin = this.hoyISO();
  excusas: AttendanceResponseDTO[] = [];
  faltasSinJustificar: AttendanceResponseDTO[] = [];
  textoJustificacion = new Map<number, string>();
  guardandoJustificacionId: number | null = null;
  errorGuardarJustificacion: string | null = null;
  cargandoExcusas = false;
  errorExcusas: string | null = null;
  excusasConsultadas = false;
  revisandoId: number | null = null;

  // --- Panel lateral: descargar historial por estudiante o por curso ---
  panelDescargaAbierto = false;
  panelDescargaTab: 'estudiante' | 'curso' = 'estudiante';
  panelDescargaBusqueda = '';
  panelDescargaNivel: number | null = null;
  panelDescargaGrado: number | 'todos' = 'todos';
  panelDescargaCargando = false;
  panelDescargaError: string | null = null;
  panelDescargaGenerando = false;

  panelDescargaEstudiantes: {
    idStudent: number;
    nombre: string;
    idCourse: number;
    grado: string;
    porcentaje: number | null;
  }[] = [];

  panelDescargaCursos: {
    idCourse: number;
    nombre: string;
    porcentaje: number | null;
  }[] = [];

  panelDescargaSeleccionEstudiantes = new Set<number>();
  panelDescargaSeleccionCursos = new Set<number>();

  constructor(
    private asistenciaService: AsistenciaService,
    private perfilService: PerfilService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.cargandoBase = true;
    this.errorBase = null;

    forkJoin({
      cursos: this.asistenciaService.listarCursos(),
      niveles: this.asistenciaService.listarNiveles(),
      estudiantes: this.asistenciaService.listarEstudiantes(),
      docentes: this.asistenciaService.listarDocentes(),
      perfil: this.perfilService.obtenerMiPerfil().pipe(
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

        const perfilAny: any = perfil;
        const rol = (perfilAny?.roleName || '').toLowerCase();

        this.idAdminActual = perfilAny?.idUser ?? null;
        this.idUsuarioActual = perfilAny?.idUser ?? null;
        this.nombreUsuarioActual = `${perfilAny?.name ?? ''} ${perfilAny?.surnames ?? ''}`.trim();

        this.esDirectivo = rol.includes('direct');
        this.esDocente = rol.includes('docente');
        this.esEstudiante = rol.includes('estudiante');
        this.esAdministrador = rol.includes('admin') && !this.esDirectivo;

        let cursosVisibles = cursos.filter(c => c.status);

        // El Docente solo debe ver los cursos donde da clase.
        if (this.esDocente && this.idUsuarioActual !== null) {
          cursosVisibles = cursosVisibles.filter(
            c => c.homeroomTeacher === this.idUsuarioActual
          );
        }

        this.cursos = cursosVisibles;

        if (this.esEstudiante) {
          const idCursoPerfil = Number(perfilAny?.idCourse);

          const nombreCursoEstudiante = (
            perfilAny?.grado ??
            perfilAny?.grade ??
            perfilAny?.curso ??
            perfilAny?.course ??
            ''
          )
            .toString()
            .trim()
            .toLowerCase();

          const cursoEncontrado = cursosVisibles.find(
            c =>
              (Number.isFinite(idCursoPerfil) &&
                idCursoPerfil > 0 &&
                c.idCourse === idCursoPerfil) ||
              c.name.trim().toLowerCase() === nombreCursoEstudiante
          );

          this.idCursoEstudiante =
            cursoEncontrado?.idCourse ??
            (Number.isFinite(idCursoPerfil) && idCursoPerfil > 0
              ? idCursoPerfil
              : null);

          this.idCursoSeleccionado = this.idCursoEstudiante;
          this.filtroListadoCurso = this.idCursoEstudiante;
          this.filtroExcusasCurso = this.idCursoEstudiante;
          this.filtroSesionesCurso = this.idCursoEstudiante;

          this.tabActiva = 'resumen';
        } else if (this.cursos.length > 0) {
          const primerCurso = this.cursos[0].idCourse;

          this.idCursoSeleccionado = primerCurso;
          this.filtroListadoCurso = primerCurso;
          this.filtroExcusasCurso = primerCurso;
          this.tomaCurso = primerCurso;

          if (this.esDirectivo) {
            this.tabActiva = 'listado';
          }
        }

        this.cargandoBase = false;
        this.breadcrumbService.setExtra(
          this.tabActiva === this.tabPorDefecto
            ? null
            : ETIQUETA_TAB[this.tabActiva]
        );

        if (this.esEstudiante) {
          this.miResumenConsultado = true;
          this.buscarMiResumen();
        } else {
          this.buscarSesiones();
          this.cargarToma();
        }
      },
      error: () => {
        this.errorBase =
          'No se pudo cargar la información base (cursos, niveles, docentes o estudiantes).';
        this.cargandoBase = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setExtra(null);
  }

  cambiarTab(tab: Tab): void {
    // El Estudiante no puede tomar asistencia.
    // El Directivo tampoco: solo puede consultar (resumen, historial, listado, justificaciones).
    if (tab === 'tomar' && (this.esEstudiante || this.esDirectivo)) {
      return;
    }

    this.tabActiva = tab;

    this.breadcrumbService.setExtra(
      tab === this.tabPorDefecto ? null : ETIQUETA_TAB[tab]
    );

    if (
      tab === 'resumen' &&
      this.esEstudiante &&
      !this.miResumenConsultado
    ) {
      this.miResumenConsultado = true;
      this.buscarMiResumen();
    }

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

    if (tab === 'tomar') {
      this.cargarToma();
    }
  }

  cargarToma(): void {
    this.errorGuardarToma = null;
    this.exitoGuardarToma = false;

    if (this.tomaCurso === null || !this.tomaFecha) {
      this.tomaFilas = [];
      return;
    }

    this.cargandoToma = true;
    this.errorToma = null;

    forkJoin({
      estudiantes: this.asistenciaService.listarEstudiantesPorCurso(
        this.tomaCurso
      ),
      registros: this.asistenciaService.obtenerHistorialPorCurso(
        this.tomaCurso,
        this.tomaFecha,
        this.tomaFecha
      )
    }).subscribe({
      next: ({ estudiantes, registros }) => {
        const porEstudiante = new Map<number, AttendanceResponseDTO>();

        registros.forEach(r => {
          if (!porEstudiante.has(r.idStudent)) {
            porEstudiante.set(r.idStudent, r);
          }
        });

        this.tomaFilas = estudiantes
          .map(e => {
            const registro = porEstudiante.get(e.idUser);

            return {
              idStudent: e.idUser,
              nombre: `${e.name} ${e.surnames}`.trim(),
              idAttendance: registro?.idAttendance ?? null,
              estado:
                registro?.attendanceStatus ??
                ('PRESENT' as AttendanceStatus)
            };
          })
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        this.cargandoToma = false;
      },
      error: () => {
        this.errorToma =
          'No se pudo cargar la lista de estudiantes del curso.';
        this.tomaFilas = [];
        this.cargandoToma = false;
      }
    });
  }

  marcarEstado(
    fila: {
      idStudent: number;
      nombre: string;
      idAttendance: number | null;
      estado: AttendanceStatus;
    },
    estado: AttendanceStatus
  ): void {
    fila.estado = estado;
    this.exitoGuardarToma = false;
  }

  guardarToma(): void {
    // Un Directivo no puede tomar asistencia (el tab ya está oculto para él, esto es un respaldo).
    if (this.esDirectivo) {
      return;
    }

    if (this.guardandoToma) {
      return;
    }

    if (
      this.tomaCurso === null ||
      !this.tomaFecha ||
      !this.tomaFilas.length
    ) {
      return;
    }

    this.guardandoToma = true;
    this.errorGuardarToma = null;
    this.exitoGuardarToma = false;

    const idCurso = this.tomaCurso;

    const llamadas = this.tomaFilas.map(fila =>
      this.guardarFilaToma(idCurso, fila)
    );

    forkJoin(llamadas).subscribe(resultados => {
      const mensajesError = new Set<string>();

      resultados.forEach(r => {
        if (r.ok && r.resultado) {
          r.fila.idAttendance = r.resultado.idAttendance;
        } else if (r.mensaje) {
          mensajesError.add(r.mensaje);
        }
      });

      this.guardandoToma = false;

      if (mensajesError.size) {
        this.errorGuardarToma =
          Array.from(mensajesError).join(' | ');
      } else {
        this.exitoGuardarToma = true;
      }

      this.listadoConsultado = false;
      this.excusasConsultadas = false;
      this.resumenPorCurso = [];
    });
  }

  private guardarFilaToma(
    idCurso: number,
    fila: {
      idStudent: number;
      nombre: string;
      idAttendance: number | null;
      estado: AttendanceStatus;
    }
  ): Observable<{
    ok: boolean;
    fila: {
      idStudent: number;
      nombre: string;
      idAttendance: number | null;
      estado: AttendanceStatus;
    };
    resultado: AttendanceResponseDTO | null;
    mensaje?: string;
  }> {
    const dto: AttendanceRequestDTO = {
      idSchedule: this.ID_SCHEDULE_ASISTENCIA,
      idStudent: fila.idStudent,
      idCourse: idCurso,
      attendanceDate: this.tomaFecha,
      attendanceStatus: fila.estado
    };

    const mensajeDe = (err: HttpErrorResponse): string =>
      err?.error?.message ||
      `${fila.nombre}: error al guardar (HTTP ${err?.status ?? '?'})`;

    if (fila.idAttendance) {
      return this.asistenciaService
        .actualizarAsistencia(fila.idAttendance, dto)
        .pipe(
          map(resultado => ({
            ok: true,
            fila,
            resultado
          })),
          catchError((err: HttpErrorResponse) =>
            of({
              ok: false,
              fila,
              resultado: null,
              mensaje: mensajeDe(err)
            })
          )
        );
    }

    return this.asistenciaService
      .registrarAsistencia(dto)
      .pipe(
        map(resultado => ({
          ok: true,
          fila,
          resultado
        })),
        catchError((err: HttpErrorResponse) => {
          const backendMsg: string =
            err?.error?.message ?? '';

          const esDuplicado =
            err.status === 409 &&
            backendMsg.toLowerCase().includes('ya existe');

          if (!esDuplicado) {
            return of({
              ok: false,
              fila,
              resultado: null,
              mensaje: mensajeDe(err)
            });
          }

          return this.asistenciaService
            .obtenerHistorialPorEstudiante(
              fila.idStudent,
              this.tomaFecha,
              this.tomaFecha
            )
            .pipe(
              switchMap(registros => {
                const existente = registros.find(
                  r =>
                    r.idSchedule ===
                    this.ID_SCHEDULE_ASISTENCIA
                );

                if (!existente) {
                  return of({
                    ok: false,
                    fila,
                    resultado: null,
                    mensaje:
                      `${fila.nombre}: el backend indicó duplicado pero no se encontró el registro existente.`
                  });
                }

                return this.asistenciaService
                  .actualizarAsistencia(
                    existente.idAttendance,
                    dto
                  )
                  .pipe(
                    map(resultado => ({
                      ok: true,
                      fila,
                      resultado
                    })),
                    catchError(
                      (err2: HttpErrorResponse) =>
                        of({
                          ok: false,
                          fila,
                          resultado: null,
                          mensaje: mensajeDe(err2)
                        })
                    )
                  );
              }),
              catchError(
                (err2: HttpErrorResponse) =>
                  of({
                    ok: false,
                    fila,
                    resultado: null,
                    mensaje: mensajeDe(err2)
                  })
              )
            );
        })
      );
  }

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

  get sesionesFiltradas(): SesionResumen[] {
    const q = this.busquedaSesiones.trim().toLowerCase();

    if (!q) {
      return this.sesiones;
    }

    return this.sesiones.filter(
      s =>
        s.nombreCurso.toLowerCase().includes(q) ||
        s.docente.toLowerCase().includes(q)
    );
  }

  get sesionesAgrupadas(): {
    fecha: string;
    etiqueta: string;
    items: SesionResumen[];
  }[] {
    const grupos = new Map<string, SesionResumen[]>();

    this.sesionesFiltradas.forEach(s => {
      const lista = grupos.get(s.fecha) ?? [];
      lista.push(s);
      grupos.set(s.fecha, lista);
    });

    const hoy = this.hoyISO();
    const manana = this.sumarDiasISO(hoy, 1);

    return Array.from(grupos.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([fecha, items]) => ({
        fecha,
        etiqueta:
          fecha === hoy
            ? 'Hoy'
            : fecha === manana
            ? 'Mañana'
            : fecha,
        items
      }));
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

  /**
   * Resumen personal del Estudiante: sus propios registros de asistencia
   * y su porcentaje, en vez del listado de sesiones de todo el curso.
   */
  buscarMiResumen(): void {
    if (this.idUsuarioActual === null) {
      return;
    }

    if (!this.fechaInicioSesiones || !this.fechaFinSesiones) {
      this.errorMiResumen = 'Selecciona las fechas de inicio y fin.';
      return;
    }

    if (this.fechaInicioSesiones > this.fechaFinSesiones) {
      this.errorMiResumen =
        'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    this.cargandoMiResumen = true;
    this.errorMiResumen = null;

    forkJoin({
      registros: this.asistenciaService.obtenerHistorialPorEstudiante(
        this.idUsuarioActual,
        this.fechaInicioSesiones,
        this.fechaFinSesiones
      ),
      resumen: this.asistenciaService
        .obtenerResumenPorEstudiante(
          this.idUsuarioActual,
          this.fechaInicioSesiones,
          this.fechaFinSesiones
        )
        .pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ registros, resumen }) => {
        this.misRegistros = (registros ?? [])
          .slice()
          .sort((a, b) => {
            const fecha = b.attendanceDate.localeCompare(a.attendanceDate);
            return fecha !== 0 ? fecha : b.idAttendance - a.idAttendance;
          });

        if (this.esEstudiante && this.idCursoEstudiante === null) {
          const cursoDelHistorial = this.misRegistros.find(r => r.idCourse)?.idCourse;
          if (cursoDelHistorial) {
            this.idCursoEstudiante = cursoDelHistorial;
            this.idCursoSeleccionado = cursoDelHistorial;
            this.filtroListadoCurso = cursoDelHistorial;
            this.filtroExcusasCurso = cursoDelHistorial;
          }
        }

        this.miResumenPersonal = resumen;
        this.cargandoMiResumen = false;
      },
      error: () => {
        this.errorMiResumen =
          'No se pudo cargar tu resumen de asistencia.';
        this.cargandoMiResumen = false;
      }
    });
  }

  private sumarDiasISO(fechaISO: string, dias: number): string {
    const d = new Date(`${fechaISO}T00:00:00`);
    d.setDate(d.getDate() + dias);

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
  }

  cargarGraficoHistorial(): void {
    if (this.esEstudiante) {
      this.cargarGraficoHistorialEstudiante();
      return;
    }

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

  /**
   * Para el Estudiante, el panel "Historial" (gráficos) muestra únicamente
   * su propio porcentaje de asistencia en vez del historial de todos los
   * cursos. Se reutiliza la misma estructura ResumenCurso para no duplicar
   * la plantilla de gráficos.
   */
  private cargarGraficoHistorialEstudiante(): void {
    if (this.idUsuarioActual === null) {
      this.resumenPorCurso = [];
      this.cargandoHistorialGrafico = false;
      return;
    }

    if (!this.fechaInicioHistorial || !this.fechaFinHistorial) {
      this.errorHistorialGrafico =
        'Selecciona las fechas del historial.';
      return;
    }

    if (this.fechaInicioHistorial > this.fechaFinHistorial) {
      this.errorHistorialGrafico =
        'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    this.cargandoHistorialGrafico = true;
    this.errorHistorialGrafico = null;

    this.asistenciaService
      .obtenerResumenPorEstudiante(
        this.idUsuarioActual,
        this.fechaInicioHistorial,
        this.fechaFinHistorial
      )
      .pipe(catchError(() => of(null)))
      .subscribe(resumen => {
        if (!resumen) {
          this.resumenPorCurso = [];
          this.errorHistorialGrafico =
            'No se pudo cargar tu historial de asistencia.';
          this.cargandoHistorialGrafico = false;
          return;
        }

        const resumenPersonal: ResumenCurso = {
          idCourse: this.idCursoEstudiante ?? 0,
          nombreCurso:
            this.nombreCurso(this.idCursoEstudiante) || 'Mi curso',
          nombreNivel: '',
          totalRecords: resumen.totalRecords,
          presentCount: resumen.presentCount,
          lateCount: resumen.lateCount,
          earlyDepartureCount: resumen.earlyDepartureCount,
          justifiedCount: resumen.justifiedAbsenceCount,
          unjustifiedCount: resumen.unjustifiedAbsenceCount,
          porcentajeAsistencia: resumen.attendancePercentage
        };

        this.resumenPorCurso = [resumenPersonal];
        this.idCursoSeleccionado = resumenPersonal.idCourse;
        this.cargandoHistorialGrafico = false;
      });
  }

  get resumenSeleccionado(): ResumenCurso | null {
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

  get barras(): {
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

  seleccionarCurso(idCourse: number): void {
    this.idCursoSeleccionado =
      idCourse;
  }

  // --- Panel lateral: descargar historial por estudiante o por curso ---

  get panelDescargaCursosDelNivel(): CourseResponseDTO[] {
    return this.cursos.filter(
      c =>
        this.panelDescargaNivel === null ||
        c.idLevel === this.panelDescargaNivel
    );
  }

  get panelDescargaEstudiantesFiltrados() {
    const q = this.panelDescargaBusqueda.trim().toLowerCase();

    if (!q) {
      return this.panelDescargaEstudiantes;
    }

    return this.panelDescargaEstudiantes.filter(e =>
      e.nombre.toLowerCase().includes(q)
    );
  }

  get panelDescargaCursosFiltrados() {
    const q = this.panelDescargaBusqueda.trim().toLowerCase();

    if (!q) {
      return this.panelDescargaCursos;
    }

    return this.panelDescargaCursos.filter(c =>
      c.nombre.toLowerCase().includes(q)
    );
  }

  get panelDescargaTotalDisponible(): number {
    return this.panelDescargaTab === 'estudiante'
      ? this.panelDescargaEstudiantesFiltrados.length
      : this.panelDescargaCursosFiltrados.length;
  }

  get panelDescargaTotalSeleccionado(): number {
    return this.panelDescargaTab === 'estudiante'
      ? this.panelDescargaSeleccionEstudiantes.size
      : this.panelDescargaSeleccionCursos.size;
  }

  get panelDescargaTodoSeleccionado(): boolean {
    if (this.panelDescargaTab === 'estudiante') {
      const filtrados = this.panelDescargaEstudiantesFiltrados;

      return (
        filtrados.length > 0 &&
        filtrados.every(e =>
          this.panelDescargaSeleccionEstudiantes.has(e.idStudent)
        )
      );
    }

    const filtrados = this.panelDescargaCursosFiltrados;

    return (
      filtrados.length > 0 &&
      filtrados.every(c =>
        this.panelDescargaSeleccionCursos.has(c.idCourse)
      )
    );
  }

  abrirPanelDescarga(): void {
    this.panelDescargaAbierto = true;
    this.panelDescargaTab = 'estudiante';
    this.panelDescargaBusqueda = '';
    this.panelDescargaError = null;
    this.panelDescargaSeleccionEstudiantes.clear();
    this.panelDescargaSeleccionCursos.clear();

    if (this.panelDescargaNivel === null) {
      this.panelDescargaNivel = this.niveles[0]?.idLevel ?? null;
    }

    this.panelDescargaGrado = 'todos';
    this.cargarPanelDescargaDatos();
  }

  cerrarPanelDescarga(): void {
    this.panelDescargaAbierto = false;
  }

  cambiarPanelDescargaTab(tab: 'estudiante' | 'curso'): void {
    if (this.panelDescargaTab === tab) {
      return;
    }

    this.panelDescargaTab = tab;
    this.panelDescargaBusqueda = '';
    this.cargarPanelDescargaDatos();
  }

  seleccionarPanelDescargaNivel(idLevel: number): void {
    if (this.panelDescargaNivel === idLevel) {
      return;
    }

    this.panelDescargaNivel = idLevel;
    this.panelDescargaGrado = 'todos';
    this.cargarPanelDescargaDatos();
  }

  seleccionarPanelDescargaGrado(grado: number | 'todos'): void {
    if (this.panelDescargaGrado === grado) {
      return;
    }

    this.panelDescargaGrado = grado;
    this.cargarPanelDescargaDatos();
  }

  toggleSeleccionPanelEstudiante(idStudent: number): void {
    if (this.panelDescargaSeleccionEstudiantes.has(idStudent)) {
      this.panelDescargaSeleccionEstudiantes.delete(idStudent);
    } else {
      this.panelDescargaSeleccionEstudiantes.add(idStudent);
    }
  }

  toggleSeleccionPanelCurso(idCourse: number): void {
    if (this.panelDescargaSeleccionCursos.has(idCourse)) {
      this.panelDescargaSeleccionCursos.delete(idCourse);
    } else {
      this.panelDescargaSeleccionCursos.add(idCourse);
    }
  }

  toggleSeleccionarTodoPanel(): void {
    const yaTodo = this.panelDescargaTodoSeleccionado;

    if (this.panelDescargaTab === 'estudiante') {
      this.panelDescargaEstudiantesFiltrados.forEach(e => {
        if (yaTodo) {
          this.panelDescargaSeleccionEstudiantes.delete(e.idStudent);
        } else {
          this.panelDescargaSeleccionEstudiantes.add(e.idStudent);
        }
      });
    } else {
      this.panelDescargaCursosFiltrados.forEach(c => {
        if (yaTodo) {
          this.panelDescargaSeleccionCursos.delete(c.idCourse);
        } else {
          this.panelDescargaSeleccionCursos.add(c.idCourse);
        }
      });
    }
  }

  private cargarPanelDescargaDatos(): void {
    if (this.panelDescargaTab === 'estudiante') {
      this.cargarPanelDescargaEstudiantes();
    } else {
      this.cargarPanelDescargaCursos();
    }
  }

  private cargarPanelDescargaEstudiantes(): void {
    // El Estudiante solo puede descargar su propio historial, nunca el de
    // sus compañeros.
    if (this.esEstudiante) {
      if (this.idUsuarioActual === null) {
        this.panelDescargaEstudiantes = [];
        return;
      }

      this.panelDescargaCargando = true;
      this.panelDescargaError = null;

      this.asistenciaService
        .obtenerResumenPorEstudiante(
          this.idUsuarioActual,
          this.fechaInicioHistorial,
          this.fechaFinHistorial
        )
        .pipe(
          catchError(() => of(null))
        )
        .subscribe(resumen => {
          this.panelDescargaEstudiantes = [
            {
              idStudent: this.idUsuarioActual as number,
              nombre: this.nombreUsuarioActual || 'Yo',
              idCourse: this.idCursoEstudiante ?? 0,
              grado: this.nombreCurso(this.idCursoEstudiante) || 'Mi curso',
              porcentaje: resumen?.attendancePercentage ?? 0
            }
          ];
          this.panelDescargaCargando = false;
        });

      return;
    }

    const cursosObjetivo =
      this.panelDescargaGrado === 'todos'
        ? this.panelDescargaCursosDelNivel
        : this.panelDescargaCursosDelNivel.filter(
            c => c.idCourse === this.panelDescargaGrado
          );

    if (!cursosObjetivo.length) {
      this.panelDescargaEstudiantes = [];
      return;
    }

    this.panelDescargaCargando = true;
    this.panelDescargaError = null;

    forkJoin(
      cursosObjetivo.map(curso =>
        this.asistenciaService
          .listarEstudiantesPorCurso(curso.idCourse)
          .pipe(
            map(estudiantes =>
              estudiantes.map(e => ({
                idStudent: e.idUser,
                nombre: `${e.name} ${e.surnames}`.trim(),
                idCourse: curso.idCourse,
                grado: curso.name
              }))
            ),
            catchError(() => of([]))
          )
      )
    ).subscribe({
      next: listas => {
        const base = listas.flat();

        if (!base.length) {
          this.panelDescargaEstudiantes = [];
          this.panelDescargaCargando = false;
          return;
        }

        forkJoin(
          base.map(est =>
            this.asistenciaService
              .obtenerResumenPorEstudiante(
                est.idStudent,
                this.fechaInicioHistorial,
                this.fechaFinHistorial
              )
              .pipe(
                map(resumen => ({
                  ...est,
                  porcentaje: resumen?.attendancePercentage ?? 0
                })),
                catchError(() =>
                  of({
                    ...est,
                    porcentaje: null
                  })
                )
              )
          )
        ).subscribe({
          next: conPorcentaje => {
            this.panelDescargaEstudiantes = conPorcentaje;
            this.panelDescargaCargando = false;
          },
          error: () => {
            this.panelDescargaEstudiantes = base.map(e => ({
              ...e,
              porcentaje: null
            }));
            this.panelDescargaCargando = false;
          }
        });
      },
      error: () => {
        this.panelDescargaError =
          'No se pudieron cargar los estudiantes.';
        this.panelDescargaCargando = false;
      }
    });
  }

  private cargarPanelDescargaCursos(): void {
    // El Estudiante solo puede descargar el reporte de su propio curso.
    const cursosObjetivo = this.esEstudiante
      ? this.cursos.filter(c => c.idCourse === this.idCursoEstudiante)
      : this.panelDescargaCursosDelNivel;

    if (!cursosObjetivo.length) {
      this.panelDescargaCursos = [];
      return;
    }

    this.panelDescargaCargando = true;
    this.panelDescargaError = null;

    forkJoin(
      cursosObjetivo.map(curso =>
        this.asistenciaService
          .obtenerHistorialPorCurso(
            curso.idCourse,
            this.fechaInicioHistorial,
            this.fechaFinHistorial
          )
          .pipe(
            map(registros => ({
              idCourse: curso.idCourse,
              nombre: curso.name,
              porcentaje: this.asistenciaService.calcularResumen(
                registros
              ).porcentajeAsistencia
            })),
            catchError(() =>
              of({
                idCourse: curso.idCourse,
                nombre: curso.name,
                porcentaje: null
              })
            )
          )
      )
    ).subscribe({
      next: resultados => {
        this.panelDescargaCursos = resultados;
        this.panelDescargaCargando = false;
      },
      error: () => {
        this.panelDescargaError =
          'No se pudieron cargar los cursos.';
        this.panelDescargaCargando = false;
      }
    });
  }

  generarReportePanel(): void {
    const ids =
      this.panelDescargaTab === 'estudiante'
        ? Array.from(this.panelDescargaSeleccionEstudiantes)
        : Array.from(this.panelDescargaSeleccionCursos);

    if (!ids.length || this.panelDescargaGenerando) {
      return;
    }

    this.panelDescargaGenerando = true;
    this.panelDescargaError = null;

    from(ids)
      .pipe(
        concatMap(id => {
          const params =
            this.panelDescargaTab === 'estudiante'
              ? {
                  student: id,
                  startDate: this.fechaInicioHistorial,
                  endDate: this.fechaFinHistorial
                }
              : {
                  course: id,
                  startDate: this.fechaInicioHistorial,
                  endDate: this.fechaFinHistorial
                };

          const nombreEstudianteArchivo =
            this.esEstudiante && id === this.idUsuarioActual
              ? this.nombreUsuarioActual || 'mi-asistencia'
              : this.nombreEstudiante(id);

          const nombreArchivo =
            this.panelDescargaTab === 'estudiante'
              ? `asistencia-${nombreEstudianteArchivo
                  .trim()
                  .replace(/\s+/g, '-')
                  .toLowerCase()}.pdf`
              : `asistencia-${this.nombreCurso(id)
                  .trim()
                  .replace(/\s+/g, '-')
                  .toLowerCase()}.pdf`;

          return this.asistenciaService.descargarPdf(params).pipe(
            map(blob => ({ blob, nombreArchivo })),
            catchError(() => of(null))
          );
        })
      )
      .subscribe({
        next: resultado => {
          if (resultado) {
            this.descargar(
              of(resultado.blob),
              resultado.nombreArchivo
            );
          }
        },
        error: () => {
          this.panelDescargaError =
            'No se pudo generar el reporte.';
          this.panelDescargaGenerando = false;
        },
        complete: () => {
          this.panelDescargaGenerando = false;
        }
      });
  }

  descargarPdfHistorial(): void {
    if (
      this.idCursoSeleccionado ===
      null
    ) {
      return;
    }

    const params = this.esEstudiante && this.idUsuarioActual !== null
      ? {
          student: this.idUsuarioActual,
          startDate: this.fechaInicioHistorial,
          endDate: this.fechaFinHistorial
        }
      : {
          course: this.idCursoSeleccionado,
          startDate: this.fechaInicioHistorial,
          endDate: this.fechaFinHistorial
        };

    this.descargar(
      this.asistenciaService.descargarPdf(params),
      this.esEstudiante
        ? `mi-asistencia-${this.fechaInicioHistorial}-${this.fechaFinHistorial}.pdf`
        : `asistencia-historial-curso-${this.idCursoSeleccionado}.pdf`
    );
  }

  get misRegistrosAgrupados(): {
    fecha: string;
    etiqueta: string;
    items: AttendanceResponseDTO[];
  }[] {
    const grupos = new Map<string, AttendanceResponseDTO[]>();

    this.misRegistros.forEach(registro => {
      const items = grupos.get(registro.attendanceDate) ?? [];
      items.push(registro);
      grupos.set(registro.attendanceDate, items);
    });

    return Array.from(grupos.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([fecha, items]) => ({
        fecha,
        etiqueta: this.etiquetaFechaRelativa(fecha),
        items
      }));
  }

  etiquetaFechaRelativa(fechaISO: string): string {
    if (!fechaISO) {
      return '';
    }

    const hoy = new Date();
    const fecha = new Date(`${fechaISO}T00:00:00`);
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const diferencia = Math.round(
      (hoyInicio.getTime() - fechaInicio.getTime()) / 86400000
    );

    if (diferencia === 0) {
      return 'Hoy';
    }

    if (diferencia === 1) {
      return 'Ayer';
    }

    if (diferencia === -1) {
      return 'Mañana';
    }

    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(fecha).replace(/^./, letra => letra.toUpperCase());
  }

  formatoFechaCorta(fechaISO: string): string {
    if (!fechaISO) {
      return '';
    }

    const fecha = new Date(`${fechaISO}T00:00:00`);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }

  get filasListadoVisibles(): FilaGridListado[] {
    let filas = this.filasListado;

    if (this.esEstudiante && this.idUsuarioActual !== null) {
      filas = filas.filter(
        f => f.idStudent === this.idUsuarioActual
      );
    }

    const q = this.busquedaListado.trim().toLowerCase();

    if (q) {
      filas = filas.filter(f =>
        `${f.primerNombre} ${f.segundoNombre} ${f.primerApellido} ${f.segundoApellido}`
          .toLowerCase()
          .includes(q)
      );
    }

    return filas;
  }

  buscarListado(): void {
    this.errorListado = null;
    this.columnasListado = [];
    this.filasListado = [];
    this.listadoConsultado = true;

    if (!this.filtroListadoInicio || !this.filtroListadoFin) {
      this.errorListado = 'Selecciona las fechas de inicio y fin.';
      return;
    }

    if (this.filtroListadoInicio > this.filtroListadoFin) {
      this.errorListado = 'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    this.cargandoListado = true;

    if (this.esEstudiante && this.idUsuarioActual !== null) {
      this.asistenciaService
        .obtenerHistorialPorEstudiante(
          this.idUsuarioActual,
          this.filtroListadoInicio,
          this.filtroListadoFin
        )
        .subscribe({
          next: registros => {
            const registrosCurso = this.filtroListadoCurso === null
              ? registros
              : registros.filter(r => r.idCourse === this.filtroListadoCurso);

            this.construirGrid(registrosCurso ?? []);
            this.cargandoListado = false;
          },
          error: () => {
            this.errorListado = 'No se pudo cargar tu historial de asistencia.';
            this.cargandoListado = false;
          }
        });
      return;
    }

    if (this.filtroListadoCurso === null) {
      this.errorListado = 'Selecciona un curso.';
      this.cargandoListado = false;
      return;
    }

    this.asistenciaService
      .obtenerHistorialPorCurso(
        this.filtroListadoCurso,
        this.filtroListadoInicio,
        this.filtroListadoFin
      )
      .subscribe({
        next: registros => {
          this.construirGrid(registros ?? []);
          this.cargandoListado = false;
        },
        error: error => {
          this.columnasListado = [];
          this.filasListado = [];
          this.errorListado = error?.status === 404
            ? null
            : 'No se pudo cargar el listado de asistencia.';
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
          this.esEstudiante && this.idUsuarioActual === idStudent && this.nombreUsuarioActual
            ? this.nombreUsuarioActual
            : this.mapaEstudiantes.get(idStudent) ?? `Estudiante ${idStudent}`;

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
            partesNombre
              .slice(1)
              .join(' '),
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
        registro.idSchedule ??
        this.ID_SCHEDULE_ASISTENCIA,
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

    const cargarRegistros = this.esEstudiante && this.idUsuarioActual !== null
      ? this.asistenciaService.obtenerHistorialPorEstudiante(
          this.idUsuarioActual,
          this.filtroExcusasInicio,
          this.filtroExcusasFin
        )
      : this.filtroExcusasCurso !== null
        ? this.asistenciaService.obtenerHistorialPorCurso(
            this.filtroExcusasCurso,
            this.filtroExcusasInicio,
            this.filtroExcusasFin
          )
        : forkJoin(
            this.cursos.map(curso =>
              this.asistenciaService.obtenerHistorialPorCurso(
                curso.idCourse,
                this.filtroExcusasInicio,
                this.filtroExcusasFin
              ).pipe(catchError(() => of([] as AttendanceResponseDTO[])))
            )
          ).pipe(map(resultados => resultados.flat()));

    cargarRegistros.subscribe({
      next: registros => {
        const registrosVisibles = this.esEstudiante && this.filtroExcusasCurso !== null
          ? registros.filter(r => r.idCourse === this.filtroExcusasCurso)
          : registros;

        this.faltasSinJustificar =
          registrosVisibles
            .filter(
              r =>
                r.attendanceStatus === 'ABSENT' &&
                (r.justificationStatus ?? 'NONE') === 'NONE'
            )
            .sort(
              (a, b) =>
                b.attendanceDate.localeCompare(
                  a.attendanceDate
                )
            );

        this.excusas =
          registrosVisibles
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

  textoJustificacionDe(
    idAttendance: number
  ): string {
    return (
      this.textoJustificacion.get(
        idAttendance
      ) ?? ''
    );
  }

  actualizarTextoJustificacion(
    idAttendance: number,
    valor: string
  ): void {
    this.textoJustificacion.set(
      idAttendance,
      valor
    );
  }

  guardarJustificacion(
    registro: AttendanceResponseDTO
  ): void {
    // Solo Administrador/Docente pueden escribir la justificación (el Directivo solo consulta).
    if (this.esDirectivo) {
      return;
    }

    const texto =
      this.textoJustificacionDe(
        registro.idAttendance
      ).trim();

    if (!texto) {
      return;
    }

    this.guardandoJustificacionId =
      registro.idAttendance;

    this.errorGuardarJustificacion =
      null;

    this.asistenciaService
      .enviarJustificacion(
        registro.idAttendance,
        texto
      )
      .subscribe({
        next: actualizado => {
          this.faltasSinJustificar =
            this.faltasSinJustificar.filter(
              r =>
                r.idAttendance !==
                actualizado.idAttendance
            );

          const idx =
            this.excusas.findIndex(
              r =>
                r.idAttendance ===
                actualizado.idAttendance
            );

          if (idx !== -1) {
            this.excusas[idx] =
              actualizado;
          } else {
            this.excusas = [
              actualizado,
              ...this.excusas
            ];
          }

          this.textoJustificacion.delete(
            registro.idAttendance
          );

          this.guardandoJustificacionId =
            null;
        },
        error: (err: HttpErrorResponse) => {
          this.errorGuardarJustificacion = err?.status === 403
            ? 'Solo un docente o un administrador puede guardar la justificación de una falta.'
            : 'No se pudo guardar la justificación. Intenta nuevamente.';
          this.guardandoJustificacionId =
            null;
        }
      });
  }

  revisarJustificacion(
    registro: AttendanceResponseDTO,
    aprobar: boolean
  ): void {
    // Solo Administrador/Docente pueden revisar justificaciones (el Directivo solo consulta).
    if (this.esEstudiante || this.esDirectivo) {
      return;
    }

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
        error: (err: HttpErrorResponse) => {
          this.errorExcusas = err?.status === 403
            ? 'Solo un docente o un administrador puede aprobar o rechazar justificaciones.'
            : 'No se pudo registrar la revisión de la justificación.';
          this.revisandoId =
            null;
        }
      });
  }

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
        .replace(/\_/g, '-')
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