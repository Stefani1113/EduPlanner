import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HorariosService,
  MensajeIA,
  BloqueHorario,
  ConflictoHorario,
  NotificacionHorario,
  CursoDTO,
  DocenteDTO,
  ScheduleResponseDTO
} from '../../services/horarios.service';
import { PerfilService } from '../../services/perfil.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ModalService } from '../../../../core/services/modal.service';

/** Guarda la generación de la IA pendiente de publicar, para no perderla al recargar. */
const CLAVE_GENERACION_PENDIENTE = 'eduplanner.generacion-pendiente';

/** Copia del último horario publicado desde este navegador, por si el servidor falla al consultarlo. */
const CLAVE_ULTIMO_PUBLICADO = 'eduplanner.ultimo-publicado';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss']
})
export class HorariosComponent implements OnInit, OnDestroy {

  chatAbierto = false;
  mensaje = '';
  cargando = false;
  mensajes: MensajeIA[] = [];
  emocionActual = 'normal';

  vistaActual: 'horario' | 'conflictos' = 'horario';

  diaSeleccionado = 'Martes';
  horarios: BloqueHorario[] = [];
  horarioDisponible = true;

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

  private idCursoPorNombre: { [nombre: string]: number } = {};

  get esVistaRestringida(): boolean {
    return !(this.esAdministrador || this.esDirectivo);
  }

  horaActual = new Date();
  private idIntervaloReloj: ReturnType<typeof setInterval> | null = null;

  /** Generación de la IA que todavía no se ha publicado. */
  idGeneracionActual: number | null = null;

  /** Clases del horario generado por la IA (sin publicar). Se muestran en la grilla. */
  borrador: ScheduleResponseDTO[] | null = null;

  publicando = false;
  eliminando = false;

  private readonly nombresDias = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  private readonly diaSemanaPorIndice: { [dia: number]: keyof BloqueHorario } = {
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes'
  };

  constructor(
    private horariosService: HorariosService,
    private perfilService: PerfilService,
    private breadcrumbService: BreadcrumbService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.mensajes = this.horariosService.obtenerMensajeInicial();

    this.idIntervaloReloj = setInterval(() => {
      this.horaActual = new Date();
    }, 1000);

    this.conflictos = this.horariosService.obtenerConflictos();
    this.notificaciones = this.horariosService.obtenerNotificaciones();

    this.perfilService.obtenerMiPerfil().subscribe({
      next: respuesta => {
        const perfil: any = respuesta?.data;
        const rol = (perfil?.roleName || '').toLowerCase();

        this.esDirectivo = rol.includes('direct');
        this.esDocente = rol.includes('docente');
        this.esEstudiante = rol.includes('estudiante');
        this.esAdministrador = rol.includes('admin') && !this.esDirectivo;

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
    if (!this.esVistaRestringida) {
      this.restaurarGeneracionPendiente();
    }

    if (this.esVistaRestringida) {

      if (this.esEstudiante) {
        this.horariosService.obtenerCursos().subscribe({
          next: respuesta => {
            const curso = (respuesta?.data || [])
              .find(c => Number(c.idCourse) === Number(this.idCursoEstudiante));

            this.cursoSeleccionado = curso?.name || '';

            if (!this.cursoSeleccionado) {
              this.cargarNombreCursoEstudiante(this.idCursoEstudiante);
            }

            this.cargarMiHorario();
            this.cargandoPerfil = false;
          },
          error: () => {
            this.cargarNombreCursoEstudiante(this.idCursoEstudiante);
            this.cargarMiHorario();
            this.cargandoPerfil = false;
          }
        });
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
        cursos.forEach(c => this.idCursoPorNombre[c.name] = c.idCourse);

        this.cursoSeleccionado = this.cursosDisponibles[0] || '';
        this.cargarHorarioPorCurso(this.idCursoPorNombre[this.cursoSeleccionado] ?? null);
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

  /** Busca el nombre del curso del estudiante cuando no vino en la lista de cursos. */
  private cargarNombreCursoEstudiante(idCourse: number | null): void {
    if (idCourse === null || idCourse === undefined) {
      return;
    }

    this.horariosService.obtenerCursoPorId(idCourse).subscribe({
      next: respuesta => {
        if (respuesta?.data?.name) {
          this.cursoSeleccionado = respuesta.data.name;
        }
      },
      error: () => {
        // Se deja "Sin curso": el horario igual se consulta con "mi horario".
      }
    });
  }

  private cargarMiHorario(): void {
    this.horariosService.obtenerMiHorario().subscribe({
      next: respuesta => {
        const clases = respuesta?.data || [];
        this.horarios = this.construirGrilla(clases);
        this.horarioDisponible = this.horarios.length > 0;

        // Si el perfil no trajo el curso, se toma del propio horario.
        if (this.esEstudiante && !this.cursoSeleccionado && clases.length) {
          this.cargarNombreCursoEstudiante(clases[0].idCourse);
        }
      },
      error: () => {
        this.horarios = [];
        this.horarioDisponible = false;
      }
    });
  }

  private cargarHorarioPorCurso(idCourse: number | null): void {
    if (idCourse === null) {
      this.horarios = [];
      this.horarioDisponible = false;
      return;
    }

    // Con un horario de la IA pendiente, se muestra ese (de cualquier grado).
    if (this.borrador) {
      this.horarios = this.construirGrilla(
        this.borrador.filter(clase => clase.idCourse === idCourse)
      );
      this.horarioDisponible = this.horarios.length > 0;
      return;
    }

    this.horariosService.obtenerHorarioPorCurso(idCourse).subscribe({
      next: respuesta => {
        const clases = respuesta?.data || [];
        this.horarios = this.construirGrilla(clases);
        this.horarioDisponible = this.horarios.length > 0;
      },
      error: () => {
        // El servidor falló al consultar: se usa la copia del último horario publicado.
        const respaldo = this.leerUltimoPublicado()
          .filter(clase => clase.idCourse === idCourse);

        this.horarios = this.construirGrilla(respaldo);
        this.horarioDisponible = this.horarios.length > 0;
      }
    });
  }

  private cargarHorarioPorDocente(idTeacher: number | null): void {
    if (idTeacher === null) {
      this.horarios = [];
      this.horarioDisponible = false;
      return;
    }

    // Con un horario de la IA pendiente, se muestra el de este docente.
    if (this.borrador) {
      const nombre = this.normalizarNombre(this.nombreDocenteSeleccionado());

      this.horarios = this.construirGrilla(
        this.borrador.filter(clase =>
          clase.idTeacher === idTeacher ||
          this.normalizarNombre(clase.teacherName) === nombre
        )
      );
      this.horarioDisponible = this.horarios.length > 0;
      return;
    }

    this.horariosService.obtenerHorarioPorDocente(idTeacher).subscribe({
      next: respuesta => {
        const clases = respuesta?.data || [];
        this.horarios = this.construirGrilla(clases);
        this.horarioDisponible = this.horarios.length > 0;
      },
      error: () => {
        // El servidor falló al consultar: se usa la copia del último horario publicado.
        const nombre = this.normalizarNombre(this.nombreDocenteSeleccionado());
        const respaldo = this.leerUltimoPublicado().filter(clase =>
          clase.idTeacher === idTeacher ||
          this.normalizarNombre(clase.teacherName) === nombre
        );

        this.horarios = this.construirGrilla(respaldo);
        this.horarioDisponible = this.horarios.length > 0;
      }
    });
  }

  private normalizarNombre(texto: string | null | undefined): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private construirGrilla(clases: ScheduleResponseDTO[]): BloqueHorario[] {
    const filas = new Map<string, BloqueHorario>();

    const clasesOrdenadas = [...clases].sort((a, b) =>
      (a.startTime || '').localeCompare(b.startTime || '')
    );

    for (const clase of clasesOrdenadas) {
      const clave = `${clase.startTime}-${clase.endTime}`;

      if (!filas.has(clave)) {
        filas.set(clave, {
          hora: this.formatearHora(clase.startTime),
          horaFin: this.formatearHora(clase.endTime),
          lunes: '',
          martes: '',
          miercoles: '',
          jueves: '',
          viernes: '',
          descanso: false
        });
      }

      const fila = filas.get(clave) as BloqueHorario;
      const diaKey = this.diaSemanaPorIndice[clase.dayOfWeek];

      if (diaKey) {
        (fila as any)[diaKey] = clase.subjectName || '';
      }
    }

    return Array.from(filas.values());
  }

  private formatearHora(horaIso: string): string {
    if (!horaIso) {
      return '';
    }

    const [horas, minutos] = horaIso.split(':').map(Number);
    const periodo = horas >= 12 ? 'pm' : 'am';
    let horas12 = horas % 12;

    if (horas12 === 0) {
      horas12 = 12;
    }

    return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
  }

  alternarVista(vista: 'horario' | 'conflictos'): void {
    if (this.esVistaRestringida && vista === 'conflictos') {
      return;
    }
    this.vistaActual = vista;
    this.breadcrumbService.setExtra(vista === 'conflictos' ? 'Conflictos' : null);
  }

  alternarSelectorCursos(): void {
    if (this.esVistaRestringida) {
      return;
    }
    this.selectorDocentesAbierto = false;
    this.selectorCursosAbierto = !this.selectorCursosAbierto;
  }

  alternarSelectorDocentes(): void {
    if (this.esVistaRestringida) {
      return;
    }
    this.selectorCursosAbierto = false;
    this.selectorDocentesAbierto = !this.selectorDocentesAbierto;
  }

  cambiarModoConsulta(modo: 'curso' | 'docente'): void {
    this.modoConsulta = modo;
    this.selectorCursosAbierto = false;
    this.selectorDocentesAbierto = false;

    if (modo === 'curso') {
      this.cargarHorarioPorCurso(this.idCursoPorNombre[this.cursoSeleccionado] ?? null);
    } else {
      this.cargarHorarioPorDocente(this.docenteSeleccionado?.idUser ?? null);
    }
  }

  seleccionarCurso(curso: string): void {
    this.cursoSeleccionado = curso;
    this.selectorCursosAbierto = false;
    this.cargarHorarioPorCurso(this.idCursoPorNombre[curso] ?? null);
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
  }

  obtenerNombreDiaActual(): string {
    return this.nombresDias[this.horaActual.getDay()];
  }

  obtenerHoraFormateada(): string {
    const horas = this.horaActual.getHours().toString().padStart(2, '0');
    const minutos = this.horaActual.getMinutes().toString().padStart(2, '0');
    const segundos = this.horaActual.getSeconds().toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
  }

  abrirChat(): void {
    if (this.esVistaRestringida) {
      return;
    }
    this.chatAbierto = true;
    if (this.mensajes.length === 0) {
      this.mensajes = this.horariosService.obtenerMensajeInicial();
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

    this.mensajes.push({
      tipo: 'usuario',
      texto
    });

    this.mensaje = '';
    this.cargando = true;
    this.emocionActual = 'pensando';

    this.horariosService.enviarMensajeIA(texto).subscribe({
      next: respuesta => {
        const textoRespuesta = respuesta?.success
          ? (respuesta.response || 'Listo.')
          : (respuesta?.error || 'No pude procesar tu solicitud.');

        this.mensajes.push({
          tipo: 'ia',
          texto: textoRespuesta
        });

        this.emocionActual = respuesta?.success ? 'feliz' : 'normal';
        this.cargando = false;

        // El servicio de IA solo devuelve el texto, así que el id de la
        // generación se toma de la respuesta ("ID de generación: 5").
        const idGeneracion = respuesta?.idGeneration
          ?? this.extraerIdGeneracion(textoRespuesta);

        if (respuesta?.success && idGeneracion !== null) {
          this.idGeneracionActual = idGeneracion;
          this.guardarGeneracionPendiente(idGeneracion);
          this.cargarBorrador(true);
        }
      },
      error: () => {
        this.mensajes.push({
          tipo: 'ia',
          texto: 'No pude conectarme con el asistente de horarios. Intenta nuevamente en unos segundos.'
        });
        this.emocionActual = 'normal';
        this.cargando = false;
      }
    });
  }

  private extraerIdGeneracion(texto: string): number | null {
    const coincidencia = /id\s+de\s+generaci[oó]n\W*(\d+)/i.exec(texto || '');
    return coincidencia ? Number(coincidencia[1]) : null;
  }

  obtenerImagenIA(): string {
    return `/assets/ia/ia-ordinary.png`;
  }

  usarPregunta(pregunta: string): void {
    this.mensaje = pregunta;
    this.enviarMensaje();
  }

  // ---------------------------------------------------------------------
  // Horario generado por la IA: se muestra, y luego se publica o se elimina
  // ---------------------------------------------------------------------

  /** Carga en la grilla el horario que acaba de generar la IA (sin publicar). */
  private cargarBorrador(esNuevo: boolean): void {
    if (this.idGeneracionActual === null) {
      return;
    }

    this.horariosService.previsualizarGeneracion(this.idGeneracionActual).subscribe({
      next: respuesta => {
        this.borrador = respuesta?.data || [];

        // Al generar, se muestra el curso que la IA acaba de armar.
        if (esNuevo && this.borrador.length) {
          const idCurso = this.borrador[0].idCourse;
          const nombre = Object.keys(this.idCursoPorNombre)
            .find(n => this.idCursoPorNombre[n] === idCurso);

          if (nombre) {
            this.modoConsulta = 'curso';
            this.cursoSeleccionado = nombre;
          }
        }

        this.refrescarVista();

        this.horariosService.limpiarNotificaciones();
        this.horariosService.registrarNotificacion({
          titulo: esNuevo
            ? 'La IA generó un nuevo horario.'
            : 'Hay un horario de la IA pendiente de publicar.',
          mensaje: 'Revísalo y presiona «Publicar horario» para que docentes y estudiantes lo vean.',
          fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
        });
        this.notificaciones = this.horariosService.obtenerNotificaciones();
      },
      error: err => {
        if (esNuevo) {
          this.modalService.error(
            err?.error?.message ?? 'No se pudo cargar el horario generado por la IA.'
          );
        } else {
          // La generación guardada ya no existe (se publicó o eliminó desde otro lado).
          this.limpiarGeneracionPendiente();
          this.refrescarVista();
        }
      }
    });
  }

  private refrescarVista(): void {
    if (this.modoConsulta === 'docente') {
      this.cargarHorarioPorDocente(this.docenteSeleccionado?.idUser ?? null);
    } else {
      this.cargarHorarioPorCurso(this.idCursoPorNombre[this.cursoSeleccionado] ?? null);
    }
  }

  async publicarGeneracion(): Promise<void> {
    if (this.idGeneracionActual === null || this.publicando) {
      return;
    }

    const confirmado = await this.modalService.confirm(
      '¿Seguro que quieres publicar este horario? Los estudiantes y docentes del curso podrán verlo.',
      'Publicar horario',
      'Sí, publicar',
      'Cancelar'
    );

    if (!confirmado || this.idGeneracionActual === null) {
      return;
    }

    this.publicando = true;

    this.horariosService.publicarGeneracion(this.idGeneracionActual).subscribe({
      next: () => {
        this.publicando = false;
        this.guardarUltimoPublicado(this.borrador || []);
        this.limpiarGeneracionPendiente();
        this.refrescarVista();

        this.modalService.success(
          'El horario se publicó correctamente. Los estudiantes y docentes del curso ya pueden verlo.'
        );
      },
      error: err => {
        this.publicando = false;
        this.modalService.error(
          err?.error?.message ?? 'No se pudo publicar el horario.'
        );
      }
    });
  }

  async eliminarGeneracion(): Promise<void> {
    if (this.idGeneracionActual === null || this.eliminando) {
      return;
    }

    const confirmado = await this.modalService.confirmWarning(
      '¿Seguro que quieres eliminar este horario? Esta acción no se puede deshacer.',
      'Eliminar horario',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmado || this.idGeneracionActual === null) {
      return;
    }

    this.eliminando = true;

    this.horariosService.eliminarGeneracion(this.idGeneracionActual).subscribe({
      next: () => {
        this.eliminando = false;
        this.limpiarGeneracionPendiente();
        this.refrescarVista();

        this.modalService.success('El horario se eliminó correctamente.');
      },
      error: err => {
        this.eliminando = false;
        this.modalService.error(
          err?.error?.message ?? 'No se pudo eliminar el horario.'
        );
      }
    });
  }

  private guardarUltimoPublicado(clases: ScheduleResponseDTO[]): void {
    try {
      localStorage.setItem(CLAVE_ULTIMO_PUBLICADO, JSON.stringify(clases));
    } catch {
      // Sin almacenamiento local: solo se pierde la copia de respaldo.
    }
  }

  private leerUltimoPublicado(): ScheduleResponseDTO[] {
    try {
      const guardado = localStorage.getItem(CLAVE_ULTIMO_PUBLICADO);
      const datos = guardado ? JSON.parse(guardado) : [];
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  // --- generación pendiente (persistida para sobrevivir a una recarga) ---

  private guardarGeneracionPendiente(id: number): void {
    try {
      localStorage.setItem(CLAVE_GENERACION_PENDIENTE, String(id));
    } catch {
      // Sin almacenamiento local: solo se pierde la restauración tras recargar.
    }
  }

  private restaurarGeneracionPendiente(): void {
    try {
      const guardada = Number(localStorage.getItem(CLAVE_GENERACION_PENDIENTE));

      if (Number.isInteger(guardada) && guardada > 0) {
        this.idGeneracionActual = guardada;
        this.cargarBorrador(false);
      }
    } catch {
      // Ignorar.
    }
  }

  private limpiarGeneracionPendiente(): void {
    this.idGeneracionActual = null;
    this.borrador = null;
    this.horariosService.limpiarNotificaciones();
    this.notificaciones = [];

    try {
      localStorage.removeItem(CLAVE_GENERACION_PENDIENTE);
    } catch {
      // Ignorar.
    }
  }
}