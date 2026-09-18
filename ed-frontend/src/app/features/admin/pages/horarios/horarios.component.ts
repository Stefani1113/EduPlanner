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
  ClaseHorarioDTO
} from '../../services/horarios.service';
import { PerfilService } from '../../services/perfil.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';

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
    private breadcrumbService: BreadcrumbService
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
    if (this.esVistaRestringida) {

      if (this.esEstudiante) {
        this.horariosService.obtenerCursos().subscribe({
          next: respuesta => {
            const curso = (respuesta?.data || [])
              .find(c => c.idCourse === this.idCursoEstudiante);

            this.cursoSeleccionado = curso?.name || '';
            this.cargarHorario(this.idCursoEstudiante);
            this.cargandoPerfil = false;
          },
          error: () => {
            this.cargarHorario(this.idCursoEstudiante);
            this.cargandoPerfil = false;
          }
        });
        return;
      }

      if (this.esDocente) {
        this.cursoSeleccionado = 'Mi horario';
        this.cargarHorario(null);
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
        this.cargarHorario(this.idCursoPorNombre[this.cursoSeleccionado] ?? null);
        this.cargandoPerfil = false;
      },
      error: () => {
        this.cargandoPerfil = false;
      }
    });
  }

  private cargarHorario(idCourse: number | null): void {
    this.horariosService.obtenerMiHorario(idCourse).subscribe({
      next: respuesta => {
        const clases = respuesta?.data || [];
        this.horarios = this.construirGrilla(clases);
        this.horarioDisponible = this.horarios.length > 0;
      },
      error: () => {
        this.horarios = [];
        this.horarioDisponible = false;
      }
    });
  }

  private construirGrilla(clases: ClaseHorarioDTO[]): BloqueHorario[] {
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
    this.selectorCursosAbierto = !this.selectorCursosAbierto;
  }

  seleccionarCurso(curso: string): void {
    this.cursoSeleccionado = curso;
    this.selectorCursosAbierto = false;
    this.cargarHorario(this.idCursoPorNombre[curso] ?? null);
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

        if (respuesta?.success) {
          this.actualizarHorarioTrasIA();
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

  private actualizarHorarioTrasIA(): void {
    const idCourse = this.idCursoPorNombre[this.cursoSeleccionado] ?? null;
    this.cargarHorario(idCourse);

    this.horariosService.registrarNotificacion({
      titulo: 'La IA generó un nuevo horario.',
      mensaje: 'El horario mostrado ya refleja la última generación disponible.',
      fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
    });

    this.notificaciones = this.horariosService.obtenerNotificaciones();
  }

  obtenerImagenIA(): string {
    return `/assets/ia/ia-ordinary.png`;
  }

  usarPregunta(pregunta: string): void {
    this.mensaje = pregunta;
    this.enviarMensaje();
  }
}