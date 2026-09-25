import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  HorariosService,
  MensajeIA,
  BloqueHorario,
  ConflictoHorario,
  NotificacionHorario,
  DocenteDTO,
  ScheduleResponseDTO,
  TimeSlotResponseDTO
} from '../../services/horarios.service';
import { PerfilService } from '../../services/perfil.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ModalService } from '../../../../core/services/modal.service';

const CLAVE_GENERACIONES_PENDIENTES = 'eduplanner.generaciones-pendientes';
const CLAVE_GENERACIONES_PUBLICADAS = 'eduplanner.generaciones-publicadas';
const CLAVE_HORARIOS_PUBLICADOS = 'eduplanner.horarios-publicados';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss']
})
export class HorariosComponent implements OnInit, OnDestroy {
  chatAbierto = false;
  mensaje = '';
  cargando = false;
  descargandoPdf = false;
  mensajes: MensajeIA[] = [];
  emocionActual = 'normal';
  vistaActual: 'horario' | 'conflictos' = 'horario';
  diaSeleccionado = '';
  private siguiendoHoy = true;

  horarios: BloqueHorario[] = [];
  horarioDisponible = true;
  private franjasDisponibles: TimeSlotResponseDTO[] = [];
  private clasesActuales: ScheduleResponseDTO[] = [];

  /**
   * Caché de nombres de curso por idCourse, para poder mostrar
   * en cada bloque del horario a qué curso pertenece esa clase
   * (por ejemplo en el horario de un docente, que puede dictar
   * distintos cursos en distintos bloques de la semana).
   */
  private nombresCursoCache = new Map<number, string>();

  conflictos: ConflictoHorario[] = [];
  notificaciones: NotificacionHorario[] = [];

  get notificacionActual(): NotificacionHorario | null {
    if (this.esVistaRestringida) {
      return null;
    }
    return this.notificaciones[0] || null;
  }

  cursosDisponibles: string[] = [];
  cursoSeleccionado = '';
  selectorCursosAbierto = false;

  docentesDisponibles: DocenteDTO[] = [];
  docenteSeleccionado: DocenteDTO | null = null;
  selectorDocentesAbierto = false;

  modoConsulta: 'curso' | 'docente' = 'curso';

  cargandoPerfil = true;
  esEstudiante = false;
  esDocente = false;
  esDirectivo = false;
  esAdministrador = false;
  idCursoEstudiante: number | null = null;

  private idCursoPorNombre: {
    [nombre: string]: number;
  } = {};

  get esVistaRestringida(): boolean {
    return !(this.esAdministrador || this.esDirectivo);
  }

  horaActual = new Date();

  private idIntervaloReloj:
    ReturnType<typeof setInterval> | null = null;

  idGeneracionActual: number | null = null;
  idGeneracionPublicadaActual: number | null = null;
  borrador: ScheduleResponseDTO[] | null = null;

  publicando = false;
  eliminando = false;
  reemplazando = false;

  private generacionesPendientes: {
    [idCourse: string]: number;
  } = {};

  private generacionesPublicadas: {
    [idCourse: string]: number;
  } = {};

  private horariosPublicados: {
    [idCourse: string]: ScheduleResponseDTO[];
  } = {};

  private readonly nombresDias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ];

  private readonly diaSemanaPorIndice: {
    [dia: number]: keyof BloqueHorario;
  } = {
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes'
  };

  private readonly nombreDiaPorIndice: {
    [dia: number]: string;
  } = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes'
  };

  get hayBorrador(): boolean {
    return this.borrador !== null && this.borrador.length > 0;
  }

  get hayHorarioPublicado(): boolean {
    return this.idGeneracionPublicadaActual !== null;
  }

  get puedePublicar(): boolean {
    return (
      this.esAdministrador &&
      this.idGeneracionActual !== null &&
      this.hayBorrador &&
      !this.publicando
    );
  }

  get puedeEliminar(): boolean {
    return (
      this.esAdministrador &&
      this.idGeneracionPublicadaActual !== null &&
      !this.eliminando
    );
  }

  get puedeUsarIA(): boolean {
    return this.esAdministrador;
  }

  get existeHorarioAnteriorParaBorrador(): boolean {
    return this.idGeneracionPublicadaActual !== null;
  }

  constructor(
    private horariosService: HorariosService,
    private perfilService: PerfilService,
    private breadcrumbService: BreadcrumbService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.mensajes = this.horariosService.obtenerMensajeInicial();

    this.diaSeleccionado =
      this.nombreDiaPorIndice[this.horaActual.getDay()] || 'Lunes';

    this.idIntervaloReloj = setInterval(() => {
      this.horaActual = new Date();

      if (this.siguiendoHoy) {
        this.diaSeleccionado =
          this.nombreDiaPorIndice[this.horaActual.getDay()] ||
          this.diaSeleccionado;
      }
    }, 1000);

    this.conflictos = this.horariosService.obtenerConflictos();
    this.notificaciones = this.horariosService.obtenerNotificaciones();

    this.cargarGeneracionesPendientes();
    this.cargarGeneracionesPublicadas();
    this.cargarFranjasHorarias();

    this.perfilService.obtenerMiPerfil().subscribe({
      next: respuesta => {
        const perfil: any = respuesta?.data;
        const rol = (perfil?.roleName || '').toLowerCase();

        this.esDirectivo = rol.includes('direct');
        this.esDocente = rol.includes('docente');
        this.esEstudiante = rol.includes('estudiante');
        this.esAdministrador =
          rol.includes('admin') && !this.esDirectivo;

        this.idCursoEstudiante = perfil?.idCourse ?? null;

        this.inicializarVista();
      },
      error: () => {
        this.esDirectivo = false;
        this.esDocente = false;
        this.esEstudiante = false;
        this.esAdministrador = false;
        this.cargandoPerfil = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.idIntervaloReloj !== null) {
      clearInterval(this.idIntervaloReloj);
    }

    this.breadcrumbService.setExtra(null);
  }

  private inicializarVista(): void {
    if (this.esVistaRestringida) {
      if (this.esEstudiante) {
        this.cargarHorarioEstudiante();
        return;
      }

      if (this.esDocente) {
        this.cursoSeleccionado = 'Mi horario';
        this.cargarMiHorario();
        this.cargandoPerfil = false;
        return;
      }

      this.cargandoPerfil = false;
      return;
    }

    this.horariosService.obtenerCursos().subscribe({
      next: respuesta => {
        const cursos = respuesta?.data || [];

        this.cursosDisponibles = cursos.map(c => c.name);

        this.idCursoPorNombre = {};

        cursos.forEach(c => {
          this.idCursoPorNombre[c.name] = c.idCourse;
        });

        this.cursoSeleccionado =
          this.cursosDisponibles[0] || '';

        const idCurso =
          this.idCursoPorNombre[this.cursoSeleccionado] ?? null;

        this.actualizarGeneracionPublicadaActual(idCurso);
        this.restaurarGeneracionPendientePorCurso(idCurso);
        this.cargarHorarioPorCurso(idCurso);

        this.cargandoPerfil = false;
      },
      error: () => {
        this.cargandoPerfil = false;
      }
    });

    this.horariosService.obtenerDocentes().subscribe({
      next: respuesta => {
        this.docentesDisponibles = respuesta?.data || [];
      },
      error: () => {
        this.docentesDisponibles = [];
      }
    });
  }

  private cargarHorarioEstudiante(): void {
    const idCourse = this.idCursoEstudiante;

    if (idCourse === null || idCourse === undefined) {
      this.cursoSeleccionado = 'Sin curso asignado';
      this.horarios = [];
      this.horarioDisponible = false;
      this.cargandoPerfil = false;
      return;
    }

    this.horariosService.obtenerCursoPorId(idCourse).subscribe({
      next: respuesta => {
        this.cursoSeleccionado =
          respuesta?.data?.name || `Curso ${idCourse}`;

        this.cargarHorarioPorCurso(idCourse);
        this.cargandoPerfil = false;
      },
      error: () => {
        this.cursoSeleccionado = `Curso ${idCourse}`;
        this.cargarHorarioPorCurso(idCourse);
        this.cargandoPerfil = false;
      }
    });
  }

  private cargarNombreCursoEstudiante(
    idCourse: number | null
  ): void {
    if (idCourse === null || idCourse === undefined) {
      return;
    }

    this.horariosService.obtenerCursoPorId(idCourse).subscribe({
      next: respuesta => {
        if (respuesta?.data?.name) {
          this.cursoSeleccionado = respuesta.data.name;
        }
      },
      error: () => {}
    });
  }

  private cargarMiHorario(): void {
    this.horariosService.obtenerMiHorario().subscribe({
      next: respuesta => {
        const clases = respuesta?.data || [];

        this.asignarHorarios(clases);

        if (
          this.esEstudiante &&
          !this.cursoSeleccionado &&
          clases.length
        ) {
          this.cargarNombreCursoEstudiante(
            clases[0].idCourse
          );
        }
      },
      error: () => {
        this.horarios = [];
        this.horarioDisponible = false;
      }
    });
  }

  private cargarHorarioPorCurso(
    idCourse: number | null
  ): void {
    if (idCourse === null) {
      this.horarios = [];
      this.horarioDisponible = false;
      return;
    }

    this.actualizarGeneracionPublicadaActual(idCourse);

    const borradorCurso = this.borrador?.filter(
      clase =>
        Number(clase.idCourse) === Number(idCourse)
    ) || [];

    if (borradorCurso.length > 0) {
      this.asignarHorarios(borradorCurso);
      return;
    }

    this.horariosService.obtenerHorarioPorCurso(idCourse).subscribe({
      next: respuesta => {
        const clases = respuesta?.data || [];

        if (clases.length > 0) {
          this.horariosPublicados[String(idCourse)] = [...clases];
          this.guardarHorariosPublicados();
          this.asignarHorarios(clases);
        } else {
          const respaldo =
            this.horariosPublicados[String(idCourse)] || [];

          this.asignarHorarios(respaldo);
        }
      },
      error: () => {
        const respaldo =
          this.horariosPublicados[String(idCourse)] || [];

        this.asignarHorarios(respaldo);
      }
    });
  }

  private cargarHorarioPorDocente(
    idTeacher: number | null
  ): void {
    if (idTeacher === null) {
      this.horarios = [];
      this.horarioDisponible = false;
      return;
    }

    const nombre =
      this.normalizarNombre(
        this.nombreDocenteSeleccionado()
      );

    const clasesBorrador =
      this.borrador?.filter(
        clase =>
          Number(clase.idTeacher) === Number(idTeacher) ||
          this.normalizarNombre(clase.teacherName) === nombre
      ) || [];

    if (clasesBorrador.length > 0) {
      this.asignarHorarios(clasesBorrador);
      return;
    }

    this.horariosService.obtenerHorarioPorDocente(idTeacher).subscribe({
      next: respuesta => {
        const clases = respuesta?.data || [];

        this.asignarHorarios(clases);
      },
      error: () => {
        this.horarios = [];
        this.horarioDisponible = false;
      }
    });
  }

  private normalizarNombre(
    texto: string | null | undefined
  ): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private cargarFranjasHorarias(): void {
    this.horariosService.obtenerFranjas().subscribe({
      next: respuesta => {
        this.franjasDisponibles = respuesta?.data || [];

        if (this.clasesActuales.length > 0) {
          this.asignarHorarios(this.clasesActuales);
        }
      },
      error: () => {
        this.franjasDisponibles = [];
      }
    });
  }

  /**
   * Asigna this.horarios/this.horarioDisponible a partir de una
   * lista de clases, asegurando primero que el nombre de curso de
   * cada clase esté disponible en caché.
   */
  private asignarHorarios(
    clases: ScheduleResponseDTO[]
  ): void {
    this.precargarNombresCursos(clases).then(() => {
      this.horarios = this.construirGrilla(clases);
      this.horarioDisponible = this.horarios.length > 0;
    });
  }

  /**
   * Consulta (una sola vez por curso) el nombre de cada curso
   * involucrado en las clases recibidas, y lo guarda en caché.
   */
  private async precargarNombresCursos(
    clases: ScheduleResponseDTO[]
  ): Promise<void> {
    const idsFaltantes = Array.from(
      new Set(
        (clases || [])
          .map(clase => Number(clase.idCourse))
          .filter(
            id =>
              Number.isFinite(id) &&
              !this.nombresCursoCache.has(id)
          )
      )
    );

    if (idsFaltantes.length === 0) {
      return;
    }

    await Promise.all(
      idsFaltantes.map(async id => {
        try {
          const respuesta = await firstValueFrom(
            this.horariosService.obtenerCursoPorId(id)
          );

          this.nombresCursoCache.set(
            id,
            respuesta?.data?.name || `Curso ${id}`
          );
        } catch {
          this.nombresCursoCache.set(id, `Curso ${id}`);
        }
      })
    );
  }

  private construirGrilla(
    clases: ScheduleResponseDTO[]
  ): BloqueHorario[] {
    this.clasesActuales = [...clases];

    if (!clases || clases.length === 0) {
      return [];
    }

    const filas = new Map<string, BloqueHorario>();

    const clasesOrdenadas = [...clases].sort(
      (a, b) =>
        (a.startTime || '').localeCompare(
          b.startTime || ''
        )
    );

    for (const clase of clasesOrdenadas) {
      const clave =
        `${clase.startTime}-${clase.endTime}`;

      if (!filas.has(clave)) {
        filas.set(clave, {
          hora: this.formatearHora(clase.startTime),
          horaFin: this.formatearHora(clase.endTime),
          minutosInicio: this.aMinutos(clase.startTime),
          minutosFin: this.aMinutos(clase.endTime),
          lunes: '',
          martes: '',
          miercoles: '',
          jueves: '',
          viernes: '',
          lunesCurso: '',
          martesCurso: '',
          miercolesCurso: '',
          juevesCurso: '',
          viernesCurso: '',
          descanso: false
        });
      }

      const fila = filas.get(clave)!;

      const diaKey =
        this.diaSemanaPorIndice[clase.dayOfWeek];

      if (diaKey) {
        (fila as any)[diaKey] =
          clase.subjectName || '';

        (fila as any)[`${diaKey}Curso`] =
          this.nombresCursoCache.get(
            Number(clase.idCourse)
          ) || '';
      }
    }

    const idsTimeSlot = new Set(
      clases
        .map(clase => Number(clase.idTimeSlot))
        .filter(id => Number.isFinite(id))
    );

    const jornadas = new Set<number>();

    for (const franja of this.franjasDisponibles) {
      if (
        idsTimeSlot.has(Number(franja.idTimeSlot)) &&
        franja.idShift !== undefined &&
        franja.idShift !== null
      ) {
        jornadas.add(Number(franja.idShift));
      }
    }

    const descansos =
      this.franjasDisponibles
        .filter(franja => {
          if (franja.status === false) {
            return false;
          }

          if (franja.isBreak !== true) {
            return false;
          }

          if (jornadas.size > 0) {
            return jornadas.has(Number(franja.idShift));
          }

          return false;
        })
        .sort(
          (a, b) =>
            (a.startTime || '').localeCompare(
              b.startTime || ''
            )
        );

    for (const descanso of descansos) {
      const clave =
        `${descanso.startTime}-${descanso.endTime}`;

      if (filas.has(clave)) {
        continue;
      }

      filas.set(clave, {
        hora: this.formatearHora(descanso.startTime),
        horaFin: this.formatearHora(descanso.endTime),
        minutosInicio: this.aMinutos(descanso.startTime),
        minutosFin: this.aMinutos(descanso.endTime),
        lunes: '',
        martes: '',
        miercoles: '',
        jueves: '',
        viernes: '',
        lunesCurso: '',
        martesCurso: '',
        miercolesCurso: '',
        juevesCurso: '',
        viernesCurso: '',
        descanso: true
      });
    }

    return Array.from(filas.values()).sort(
      (a, b) =>
        a.minutosInicio - b.minutosInicio
    );
  }

  private aMinutos(horaIso: string): number {
    if (!horaIso) {
      return -1;
    }

    const [horas, minutos] =
      horaIso.split(':').map(Number);

    return horas * 60 + minutos;
  }

  esBloqueActual(fila: BloqueHorario): boolean {
    if (fila.descanso) {
      return false;
    }

    const esHoy =
      this.diaSeleccionado ===
      (
        this.nombreDiaPorIndice[
          this.horaActual.getDay()
        ] || ''
      );

    if (!esHoy) {
      return false;
    }

    const minutosAhora =
      this.horaActual.getHours() * 60 +
      this.horaActual.getMinutes();

    return (
      minutosAhora >= fila.minutosInicio &&
      minutosAhora < fila.minutosFin
    );
  }

  private formatearHora(horaIso: string): string {
    if (!horaIso) {
      return '';
    }

    const [horas, minutos] =
      horaIso.split(':').map(Number);

    const periodo =
      horas >= 12 ? 'pm' : 'am';

    let horas12 = horas % 12;

    if (horas12 === 0) {
      horas12 = 12;
    }

    return `${horas12}:${minutos
      .toString()
      .padStart(2, '0')} ${periodo}`;
  }

  /**
   * Texto secundario que se muestra debajo de la asignatura
   * en cada celda del horario.
   *
   * Si el bloque tiene una clase asociada, se muestra el curso
   * al que pertenece esa clase (útil sobre todo para el docente,
   * que puede dictar distintas materias en distintos cursos a lo
   * largo de la semana). Si el bloque está vacío se conserva el
   * texto de referencia general (docente/curso seleccionado).
   */
  obtenerCursoCelda(
    horario: BloqueHorario,
    dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes'
  ): string {
    const cursoDelBloque =
      (horario as any)[`${dia}Curso`];

    if (cursoDelBloque) {
      return cursoDelBloque;
    }

    if (this.esVistaRestringida && this.esDocente) {
      return this.cursoSeleccionado;
    }

    return this.modoConsulta === 'docente'
      ? this.nombreDocenteSeleccionado()
      : this.cursoSeleccionado;
  }

  alternarVista(
    vista: 'horario' | 'conflictos'
  ): void {
    if (
      this.esVistaRestringida &&
      vista === 'conflictos'
    ) {
      return;
    }

    this.vistaActual = vista;

    this.breadcrumbService.setExtra(
      vista === 'conflictos'
        ? 'Conflictos'
        : null
    );
  }

  alternarSelectorCursos(): void {
    if (this.esVistaRestringida) {
      return;
    }

    this.selectorDocentesAbierto = false;

    this.selectorCursosAbierto =
      !this.selectorCursosAbierto;
  }

  alternarSelectorDocentes(): void {
    if (this.esVistaRestringida) {
      return;
    }

    this.selectorCursosAbierto = false;

    this.selectorDocentesAbierto =
      !this.selectorDocentesAbierto;
  }

  cambiarModoConsulta(
    modo: 'curso' | 'docente'
  ): void {
    this.modoConsulta = modo;
    this.selectorCursosAbierto = false;
    this.selectorDocentesAbierto = false;

    if (modo === 'curso') {
      const idCurso =
        this.idCursoPorNombre[
          this.cursoSeleccionado
        ] ?? null;

      this.actualizarGeneracionPublicadaActual(idCurso);
      this.restaurarGeneracionPendientePorCurso(idCurso);
      this.cargarHorarioPorCurso(idCurso);
    } else {
      this.idGeneracionPublicadaActual = null;

      this.cargarHorarioPorDocente(
        this.docenteSeleccionado?.idUser ?? null
      );
    }
  }

  seleccionarCurso(curso: string): void {
    this.cursoSeleccionado = curso;
    this.selectorCursosAbierto = false;

    const idCourse =
      this.idCursoPorNombre[curso] ?? null;

    this.actualizarGeneracionPublicadaActual(idCourse);
    this.restaurarGeneracionPendientePorCurso(idCourse);
    this.cargarHorarioPorCurso(idCourse);
  }

  seleccionarDocente(docente: DocenteDTO): void {
    this.docenteSeleccionado = docente;
    this.selectorDocentesAbierto = false;

    this.cargarHorarioPorDocente(docente.idUser);
  }

  nombreDocenteSeleccionado(): string {
    if (!this.docenteSeleccionado) {
      return 'Sin docente';
    }

    return `${this.docenteSeleccionado.name} ${this.docenteSeleccionado.surnames}`.trim();
  }

  nombreDocente(docente: DocenteDTO): string {
    return `${docente.name} ${docente.surnames}`.trim();
  }

  seleccionarDia(dia: string): void {
    this.diaSeleccionado = dia;

    this.siguiendoHoy =
      dia ===
      (
        this.nombreDiaPorIndice[
          this.horaActual.getDay()
        ] || ''
      );
  }

  obtenerNombreDiaActual(): string {
    return this.nombresDias[
      this.horaActual.getDay()
    ];
  }

  obtenerHoraFormateada(): string {
    const horas =
      this.horaActual
        .getHours()
        .toString()
        .padStart(2, '0');

    const minutos =
      this.horaActual
        .getMinutes()
        .toString()
        .padStart(2, '0');

    const segundos =
      this.horaActual
        .getSeconds()
        .toString()
        .padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`;
  }

  /**
   * CORREGIDO:
   * Antes, para estudiantes y docentes (vista restringida) este método
   * dependía de `modoConsulta` (que nunca cambia a 'docente' fuera del
   * panel de administrador) y de `idCursoPorNombre` (que nunca se llena
   * en la vista restringida, porque `inicializarVista()` hace `return`
   * antes de poblarlo para estudiante/docente). Como resultado, al
   * presionar "Exportar" en la vista de estudiante o de docente, el
   * idCourse siempre daba `null` y se mostraba el error "No se pudo
   * identificar el curso para exportar el horario." sin descargar nada.
   *
   * Ahora la vista restringida se resuelve primero y de forma directa:
   * - Docente: usa siempre el endpoint de "mi horario" (descargarMiHorarioPdf).
   * - Estudiante: usa directamente `idCursoEstudiante` (ya disponible
   *   desde el perfil), sin pasar por `idCursoPorNombre`.
   * El flujo de administrador/directivo (por curso o por docente) queda igual.
   */
  exportarHorario(): void {
    if (this.descargandoPdf) {
      return;
    }

    if (
      !this.horarios ||
      this.horarios.length === 0
    ) {
      this.modalService.error(
        this.modoConsulta === 'docente' &&
        !this.docenteSeleccionado
          ? 'Selecciona un docente para exportar su horario.'
          : 'No hay un horario disponible para exportar.'
      );
      return;
    }

    // --- Vista restringida: docente exportando su propio horario ---
    if (this.esVistaRestringida && this.esDocente) {
      this.descargandoPdf = true;

      this.horariosService.descargarMiHorarioPdf().subscribe({
        next: blob => {
          this.descargarBlob(
            blob,
            'mi-horario.pdf'
          );
          this.descargandoPdf = false;
        },
        error: err => {
          this.descargandoPdf = false;
          this.modalService.error(
            err?.error?.message ||
            'No se pudo descargar el PDF de tu horario.'
          );
        }
      });

      return;
    }

    // --- Vista restringida: estudiante exportando el horario de su curso ---
    if (this.esVistaRestringida && this.esEstudiante) {
      const idCourse = this.idCursoEstudiante;

      if (idCourse === null || idCourse === undefined) {
        this.modalService.error(
          'No se pudo identificar el curso para exportar el horario.'
        );
        return;
      }

      this.descargandoPdf = true;

      this.horariosService
        .descargarHorarioCursoPdf(idCourse)
        .subscribe({
          next: blob => {
            const nombreCurso =
              this.normalizarNombreArchivo(
                this.cursoSeleccionado || 'horario'
              );

            this.descargarBlob(
              blob,
              `horario-${nombreCurso}.pdf`
            );

            this.descargandoPdf = false;
          },
          error: err => {
            this.descargandoPdf = false;

            this.modalService.error(
              err?.error?.message ||
              'No se pudo descargar el PDF del horario.'
            );
          }
        });

      return;
    }

    // --- Vista de administrador/directivo ---
    this.descargandoPdf = true;

    if (this.modoConsulta === 'docente') {
      this.descargandoPdf = false;

      this.modalService.error(
        'La exportación PDF por docente no está disponible mediante el endpoint actual.'
      );

      return;
    }

    const idCourse =
      this.obtenerIdCursoSeleccionado();

    if (idCourse === null) {
      this.descargandoPdf = false;

      this.modalService.error(
        'No se pudo identificar el curso para exportar el horario.'
      );

      return;
    }

    this.horariosService
      .descargarHorarioCursoPdf(idCourse)
      .subscribe({
        next: blob => {
          const nombreCurso =
            this.normalizarNombreArchivo(
              this.cursoSeleccionado || 'horario'
            );

          this.descargarBlob(
            blob,
            `horario-${nombreCurso}.pdf`
          );

          this.descargandoPdf = false;
        },
        error: err => {
          this.descargandoPdf = false;

          this.modalService.error(
            err?.error?.message ||
            'No se pudo descargar el PDF del horario.'
          );
        }
      });
  }

  private descargarBlob(
    blob: Blob,
    nombreArchivo: string
  ): void {
    if (!blob || blob.size === 0) {
      this.modalService.error(
        'El servidor no devolvió datos para el PDF.'
      );
      return;
    }

    const url =
      URL.createObjectURL(blob);

    const enlace =
      document.createElement('a');

    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  abrirChat(): void {
    if (!this.esAdministrador) {
      return;
    }

    this.chatAbierto = true;

    if (this.mensajes.length === 0) {
      this.mensajes =
        this.horariosService.obtenerMensajeInicial();
    }

    this.emocionActual = 'normal';
  }

  cerrarChat(): void {
    this.chatAbierto = false;
    this.emocionActual = 'normal';
  }

  enviarMensaje(): void {
    const texto = this.mensaje.trim();

    if (!texto || this.cargando) {
      return;
    }

    if (!this.esAdministrador) {
      return;
    }

    this.mensajes.push({
      tipo: 'usuario',
      texto
    });

    this.mensaje = '';
    this.cargando = true;
    this.emocionActual = 'pensando';

    this.horariosService
      .enviarMensajeIA(texto)
      .subscribe({
        next: respuesta => {
          const textoRespuesta =
            respuesta?.success
              ? (
                  respuesta.response ||
                  'Listo.'
                )
              : (
                  respuesta?.error ||
                  'No pude procesar tu solicitud.'
                );

          this.mensajes.push({
            tipo: 'ia',
            texto: textoRespuesta
          });

          this.emocionActual =
            respuesta?.success
              ? 'feliz'
              : 'normal';

          this.cargando = false;

          const idGeneracion =
            respuesta?.idGeneration ??
            this.extraerIdGeneracion(
              textoRespuesta
            );

          if (
            respuesta?.success &&
            idGeneracion !== null
          ) {
            this.idGeneracionActual =
              idGeneracion;

            this.cargarBorrador(true);
          }
        },
        error: () => {
          this.mensajes.push({
            tipo: 'ia',
            texto:
              'No pude conectarme con el asistente de horarios. Intenta nuevamente en unos segundos.'
          });

          this.emocionActual = 'normal';
          this.cargando = false;
        }
      });
  }

  private extraerIdGeneracion(
    texto: string
  ): number | null {
    const coincidencia =
      /id\s+de\s+generaci[oó]n\W*(\d+)/i.exec(
        texto || ''
      );

    return coincidencia
      ? Number(coincidencia[1])
      : null;
  }

  obtenerImagenIA(): string {
    return '/assets/ia/ia-ordinary.png';
  }

  usarPregunta(
    pregunta: string
  ): void {
    if (!this.esAdministrador) {
      return;
    }

    this.mensaje = pregunta;
    this.enviarMensaje();
  }

  private cargarBorrador(
    esNuevo: boolean
  ): void {
    if (
      this.idGeneracionActual === null
    ) {
      return;
    }

    const idGeneracion =
      this.idGeneracionActual;

    this.horariosService
      .previsualizarGeneracion(idGeneracion)
      .subscribe({
        next: respuesta => {
          this.borrador =
            respuesta?.data || [];

          if (this.borrador.length > 0) {
            const idCourse =
              this.borrador[0].idCourse;

            this.generacionesPendientes[
              String(idCourse)
            ] = idGeneracion;

            this.guardarGeneracionesPendientes();

            const nombre =
              Object.keys(
                this.idCursoPorNombre
              ).find(
                n =>
                  this.idCursoPorNombre[n] ===
                  idCourse
              );

            if (nombre) {
              this.modoConsulta = 'curso';
              this.cursoSeleccionado = nombre;

              this.actualizarGeneracionPublicadaActual(
                idCourse
              );
            }
          }

          this.refrescarVista();

          this.horariosService.limpiarNotificaciones();

          this.horariosService.registrarNotificacion({
            titulo: esNuevo
              ? 'La IA generó un nuevo horario.'
              : 'Hay un horario de la IA pendiente de publicar.',
            mensaje:
              'Revísalo y presiona «Publicar horario» para que docentes y estudiantes lo vean.',
            fecha:
              new Date().toLocaleDateString(
                'es-CO',
                {
                  day: 'numeric',
                  month: 'long'
                }
              )
          });

          this.notificaciones =
            this.horariosService.obtenerNotificaciones();
        },
        error: err => {
          if (esNuevo) {
            this.modalService.error(
              err?.error?.message ??
              'No se pudo cargar el horario generado por la IA.'
            );
          }
        }
      });
  }

  private refrescarVista(): void {
    if (this.modoConsulta === 'docente') {
      this.cargarHorarioPorDocente(
        this.docenteSeleccionado?.idUser ?? null
      );
      return;
    }

    const idCurso =
      this.obtenerIdCursoSeleccionado();

    this.actualizarGeneracionPublicadaActual(idCurso);
    this.cargarHorarioPorCurso(idCurso);
  }

  async publicarGeneracion(): Promise<void> {
    if (!this.esAdministrador) {
      return;
    }

    if (
      this.idGeneracionActual === null ||
      this.publicando ||
      !this.borrador ||
      this.borrador.length === 0
    ) {
      return;
    }

    const idGeneracionNueva =
      this.idGeneracionActual;

    const clasesNuevas =
      [...this.borrador];

    const idCursoSeleccionado =
      this.obtenerIdCursoSeleccionado();

    const cursosDeLaGeneracion = [
      ...new Set(
        clasesNuevas
          .map(clase => Number(clase.idCourse))
          .filter(id => Number.isFinite(id))
      )
    ];

    const idCurso =
      idCursoSeleccionado ??
      (
        cursosDeLaGeneracion.length === 1
          ? cursosDeLaGeneracion[0]
          : null
      );

    if (idCurso === null) {
      this.modalService.error(
        'No se pudo identificar el curso de este horario.'
      );
      return;
    }

    if (
      cursosDeLaGeneracion.length > 0 &&
      cursosDeLaGeneracion.some(
        id => id !== Number(idCurso)
      )
    ) {
      this.modalService.error(
        'El horario generado contiene cursos diferentes al curso seleccionado. Genera nuevamente el horario para el curso correcto.'
      );
      return;
    }

    const generacionAnterior =
      this.generacionesPublicadas[
        String(idCurso)
      ] ?? null;

    if (
      generacionAnterior !== null &&
      generacionAnterior !== idGeneracionNueva
    ) {
      const confirmado =
        await this.modalService.confirm(
          'Este curso ya tiene un horario publicado. ¿Deseas reemplazarlo por el nuevo horario?',
          'Reemplazar horario',
          'Sí, reemplazar',
          'Cancelar'
        );

      if (!confirmado) {
        return;
      }

      this.reemplazando = true;
    } else {
      const confirmado =
        await this.modalService.confirm(
          '¿Seguro que quieres publicar este horario? Los estudiantes y docentes del curso podrán verlo.',
          'Publicar horario',
          'Sí, publicar',
          'Cancelar'
        );

      if (!confirmado) {
        return;
      }
    }

    this.publicando = true;

    this.horariosService
      .publicarGeneracion(idGeneracionNueva)
      .subscribe({
        next: () => {
          this.generacionesPublicadas[
            String(idCurso)
          ] = idGeneracionNueva;

          this.horariosPublicados[
            String(idCurso)
          ] = clasesNuevas;

          this.guardarGeneracionesPublicadas();
          this.guardarHorariosPublicados();

          this.eliminarGeneracionPendientePorCurso(
            idCurso
          );

          this.idGeneracionPublicadaActual =
            idGeneracionNueva;

          this.idGeneracionActual =
            idGeneracionNueva;

          this.borrador = null;
          this.publicando = false;
          this.reemplazando = false;

          this.asignarHorarios(clasesNuevas);

          this.horariosService.limpiarNotificaciones();
          this.notificaciones = [];

          this.modalService.success(
            generacionAnterior !== null
              ? 'El horario anterior fue reemplazado correctamente.'
              : 'El horario se publicó correctamente. Ahora puedes generar otro horario para este curso.'
          );
        },
        error: err => {
          this.publicando = false;
          this.reemplazando = false;

          this.modalService.error(
            err?.error?.message ??
            'No se pudo publicar el horario.'
          );
        }
      });
  }

  async eliminarGeneracion(): Promise<void> {
    if (!this.esAdministrador) {
      return;
    }

    if (
      this.idGeneracionPublicadaActual === null ||
      this.eliminando
    ) {
      return;
    }

    const confirmado =
      await this.modalService.confirm(
        '¿Seguro que quieres eliminar este horario publicado?',
        'Eliminar horario',
        'Sí, eliminar',
        'Cancelar'
      );

    if (!confirmado) {
      return;
    }

    this.eliminando = true;

    const idGeneracion =
      this.idGeneracionPublicadaActual;

    this.horariosService
      .eliminarGeneracion(idGeneracion)
      .subscribe({
        next: () => {
          const idCurso =
            this.obtenerIdCursoSeleccionado();

          if (idCurso !== null) {
            delete this.generacionesPublicadas[
              String(idCurso)
            ];

            delete this.horariosPublicados[
              String(idCurso)
            ];

            this.guardarGeneracionesPublicadas();
            this.guardarHorariosPublicados();
          }

          this.idGeneracionPublicadaActual = null;
          this.idGeneracionActual = null;
          this.borrador = null;
          this.horarios = [];
          this.horarioDisponible = false;
          this.eliminando = false;

          this.modalService.success(
            'El horario se eliminó correctamente.'
          );
        },
        error: err => {
          this.eliminando = false;

          this.modalService.error(
            err?.error?.message ??
            'No se pudo eliminar el horario.'
          );
        }
      });
  }

  private obtenerIdCursoSeleccionado(): number | null {
    if (this.modoConsulta !== 'curso') {
      return null;
    }

    return (
      this.idCursoPorNombre[
        this.cursoSeleccionado
      ] ?? null
    );
  }

  private cargarGeneracionesPendientes(): void {
    try {
      const guardadas =
        localStorage.getItem(
          CLAVE_GENERACIONES_PENDIENTES
        );

      if (!guardadas) {
        return;
      }

      const datos =
        JSON.parse(guardadas);

      if (
        datos &&
        typeof datos === 'object'
      ) {
        this.generacionesPendientes =
          datos;
      }
    } catch {
      this.generacionesPendientes = {};
    }
  }

  private guardarGeneracionesPendientes(): void {
    try {
      localStorage.setItem(
        CLAVE_GENERACIONES_PENDIENTES,
        JSON.stringify(
          this.generacionesPendientes
        )
      );
    } catch {}
  }

  private restaurarGeneracionPendientePorCurso(
    idCourse: number | null
  ): void {
    if (
      idCourse === null ||
      idCourse === undefined
    ) {
      this.idGeneracionActual = null;
      this.borrador = null;
      return;
    }

    const idGeneracion =
      this.generacionesPendientes[
        String(idCourse)
      ] ?? null;

    this.idGeneracionActual =
      idGeneracion;

    this.borrador = null;

    if (idGeneracion !== null) {
      this.cargarBorrador(false);
    }
  }

  private eliminarGeneracionPendientePorCurso(
    idCourse: number
  ): void {
    delete this.generacionesPendientes[
      String(idCourse)
    ];

    this.guardarGeneracionesPendientes();
  }

  private normalizarNombreArchivo(
    texto: string
  ): string {
    const normalizado =
      (texto || 'horario')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(
          /[^a-zA-Z0-9_-]+/g,
          '-'
        )
        .replace(
          /^-+|-+$/g,
          ''
        )
        .toLowerCase();

    return normalizado || 'horario';
  }

  private cargarGeneracionesPublicadas(): void {
    try {
      const guardadas =
        localStorage.getItem(
          CLAVE_GENERACIONES_PUBLICADAS
        );

      if (guardadas) {
        const datos =
          JSON.parse(guardadas);

        if (
          datos &&
          typeof datos === 'object'
        ) {
          this.generacionesPublicadas =
            datos;
        }
      }

      const horarios =
        localStorage.getItem(
          CLAVE_HORARIOS_PUBLICADOS
        );

      if (horarios) {
        const datosHorarios =
          JSON.parse(horarios);

        if (
          datosHorarios &&
          typeof datosHorarios === 'object'
        ) {
          this.horariosPublicados =
            datosHorarios;
        }
      }
    } catch {
      this.generacionesPublicadas = {};
      this.horariosPublicados = {};
    }
  }

  private guardarGeneracionesPublicadas(): void {
    try {
      localStorage.setItem(
        CLAVE_GENERACIONES_PUBLICADAS,
        JSON.stringify(
          this.generacionesPublicadas
        )
      );
    } catch {}
  }

  private guardarHorariosPublicados(): void {
    try {
      localStorage.setItem(
        CLAVE_HORARIOS_PUBLICADOS,
        JSON.stringify(
          this.horariosPublicados
        )
      );
    } catch {}
  }

  private actualizarGeneracionPublicadaActual(
    idCourse: number | null
  ): void {
    if (
      idCourse === null ||
      idCourse === undefined
    ) {
      this.idGeneracionPublicadaActual = null;
      return;
    }

    this.idGeneracionPublicadaActual =
      this.generacionesPublicadas[
        String(idCourse)
      ] ?? null;
  }
} 