import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HorariosService,
  MensajeIA,
  BloqueHorario,
  ConflictoHorario,
  NotificacionHorario
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

  // --- Chat IA ---
  chatAbierto = false;
  mensaje = '';
  cargando = false;
  mensajes: MensajeIA[] = [];
  emocionActual = 'normal';

  // --- Vista: Horario o Conflictos ---
  vistaActual: 'horario' | 'conflictos' = 'horario';

  // --- Tabla de horario ---
  diaSeleccionado = 'Martes';
  horarios: BloqueHorario[] = [];
  horarioDisponible = true;

  // --- Conflictos detectados ---
  conflictos: ConflictoHorario[] = [];

  // --- Notificaciones (publicación manual o generadas por la IA) ---
  notificaciones: NotificacionHorario[] = [];

  get notificacionActual(): NotificacionHorario | null {
    if (this.esVistaRestringida) {
      return null;
    }
    return this.notificaciones[0] || null;
  }

  // --- Selector de curso (Administrador / Docente) ---
  cursosDisponibles: string[] = [];
  cursoSeleccionado = '';
  selectorCursosAbierto = false;

  // --- Perfil / rol ---
  cargandoPerfil = true;
  esEstudiante = false;
  esDocente = false;
  esDirectivo = false;
  esAdministrador = false;
  gradoEstudiante: string | null = null;

  /**
   * Docente, Directivo y Estudiante comparten la misma vista restringida:
   * sin asistente IA, sin conflictos ni notificaciones, solo su horario
   * correspondiente (día, hora, exportar PDF y el grado al que pertenece).
   * Únicamente el Administrador ve las herramientas completas.
   */
  get esVistaRestringida(): boolean {
    return !this.esAdministrador;
  }

  // --- Reloj en vivo ---
  horaActual = new Date();
  private idIntervaloReloj: ReturnType<typeof setInterval> | null = null;

  private readonly nombresDias = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

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

    this.cursosDisponibles = this.horariosService.obtenerCursosRegistrados();
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

        if (this.esVistaRestringida) {
          // Docente, Directivo y Estudiante solo ven el horario que les
          // corresponde. El grado/curso puede llegar con distintos nombres
          // según cómo lo exponga finalmente el backend.
          this.gradoEstudiante =
            perfil?.grado ?? perfil?.grade ?? perfil?.curso ?? perfil?.course ?? null;

          this.cursoSeleccionado = this.gradoEstudiante || this.cursosDisponibles[0] || '';
          this.cargarHorarioDelCurso(this.cursoSeleccionado);
        } else {
          this.cursoSeleccionado = this.cursosDisponibles[0] || '';
          this.cargarHorarioDelCurso(this.cursoSeleccionado);
        }

        this.cargandoPerfil = false;
      },
      error: () => {
        // Si falla la carga del perfil, se muestra la vista de administrador
        // con el primer curso disponible como respaldo.
        this.esDirectivo = false;
        this.esDocente = false;
        this.esEstudiante = false;
        this.esAdministrador = false;
        this.cursoSeleccionado = this.cursosDisponibles[0] || '';
        this.cargarHorarioDelCurso(this.cursoSeleccionado);
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

  alternarVista(vista: 'horario' | 'conflictos'): void {
    // Docente, Directivo y Estudiante no tienen acceso a la vista de
    // conflictos: solo consultan su horario.
    if (this.esVistaRestringida && vista === 'conflictos') {
      return;
    }
    this.vistaActual = vista;
    this.breadcrumbService.setExtra(vista === 'conflictos' ? 'Conflictos' : null);
  }

  private cargarHorarioDelCurso(curso: string): void {
    const horario = this.horariosService.obtenerHorarioPorGrado(curso);
    this.horarios = horario;
    this.horarioDisponible = horario.length > 0;
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
    this.cargarHorarioDelCurso(curso);
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
    // El asistente IA solo está disponible para el Administrador.
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

    setTimeout(() => {
      const respuesta = this.horariosService.generarRespuesta(texto);
      this.mensajes.push({
        tipo: 'ia',
        texto: respuesta.texto
      });
      this.emocionActual = respuesta.emocion;
      this.cargando = false;

      this.registrarActividadDeIA(texto);
    }, 700);
  }

  /**
   * Cuando el usuario le pide a la IA organizar/crear un horario, se
   * simula que la IA generó una versión nueva: se agrega una notificación
   * y un conflicto pendiente de revisión. Esto es solo demostrativo en
   * frontend; cuando exista la IA real, este bloque debe reemplazarse por
   * el resultado que devuelva el backend.
   */
  private registrarActividadDeIA(textoUsuario: string): void {
    const texto = textoUsuario.toLowerCase();
    const esCreacionDeHorario =
      texto.includes('organizar') ||
      texto.includes('crear horario') ||
      texto.includes('genera') ||
      texto.includes('nuevo horario');

    if (!esCreacionDeHorario) {
      return;
    }

    const fecha = new Date().toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long'
    });

    this.horariosService.registrarNotificacion({
      titulo: 'La IA generó un nuevo horario.',
      mensaje: `Revisa los posibles conflictos antes de publicarlo · ${fecha}`,
      fecha
    });

    this.horariosService.registrarConflicto({
      curso: this.cursoSeleccionado || 'Sin curso',
      dia: this.diaSeleccionado,
      hora: 'Por definir',
      tipo: 'Pendiente de revisión',
      detalle: 'Este bloque fue generado automáticamente por la IA y aún no ha sido validado.',
      gravedad: 'media'
    });

    this.notificaciones = this.horariosService.obtenerNotificaciones();
    this.conflictos = this.horariosService.obtenerConflictos();
  }

  obtenerImagenIA(): string {
    return `/assets/ia/ia-ordinary.png`;
  }

  usarPregunta(pregunta: string): void {
    this.mensaje = pregunta;
    this.enviarMensaje();
  }
}