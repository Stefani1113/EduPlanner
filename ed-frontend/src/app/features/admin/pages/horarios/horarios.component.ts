import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HorariosService,
  MensajeIA,
  BloqueHorario,
  ConflictoHorario,
  CursoDTO,
  DocenteDTO,
  ScheduleResponseDTO
} from '../../services/horarios.service';
import { PerfilService } from '../../services/perfil.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ModalService } from '../../../../core/services/modal.service';

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

  idGeneracionActual: number | null = null;
  horarioPrevisualizado: ScheduleResponseDTO[] = [];
  mostrandoPrevia = false;
  previsualizando = false;
  publicando = false;
  eliminando = false;
  mensajeAccionHorario: string | null = null;
  errorAccionHorario: string | null = null;

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
            this.cargarMiHorario();
            this.cargandoPerfil = false;
          },
          error: () => {
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

  private cargarMiHorario(): void {
    this.horariosService.obtenerMiHorario().subscribe({
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

  private cargarHorarioPorCurso(idCourse: number | null): void {
    if (idCourse === null) {
      this.horarios = [];
      this.horarioDisponible = false;
      return;
    }

    this.horariosService.obtenerHorarioPorCurso(idCourse).subscribe({
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

  private cargarHorarioPorDocente(idTeacher: number | null): void {
    if (idTeacher === null) {
      this.horarios = [];
      this.horarioDisponible = false;
      return;
    }

    this.horariosService.obtenerHorarioPorDocente(idTeacher).subscribe({
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

        if (respuesta?.success) {
          this.idGeneracionActual = respuesta.idGeneration ?? this.idGeneracionActual;
          this.mostrandoPrevia = false;
          this.horarioPrevisualizado = [];
          this.mensajeAccionHorario = 'La IA generó el horario. Revísalo y pulsa Publicar horario para hacerlo visible.';
          this.errorAccionHorario = null;

          if (this.idGeneracionActual !== null) {
            this.previsualizarGeneracion();
          }
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


  obtenerImagenIA(): string {
    return `/assets/ia/ia-ordinary.png`;
  }

  usarPregunta(pregunta: string): void {
    this.mensaje = pregunta;
    this.enviarMensaje();
  }

  previsualizarGeneracion(): void {
    if (this.idGeneracionActual === null) {
      this.errorAccionHorario = 'No hay una generación reciente para previsualizar.';
      return;
    }

    this.previsualizando = true;
    this.errorAccionHorario = null;
    this.mensajeAccionHorario = null;

    this.horariosService.previsualizarGeneracion(this.idGeneracionActual).subscribe({
      next: respuesta => {
        this.horarioPrevisualizado = respuesta?.data || [];
        this.mostrandoPrevia = true;
        this.previsualizando = false;
      },
      error: (err) => {
        this.errorAccionHorario = err?.error?.message ?? 'No se pudo cargar la previsualización del horario.';
        this.previsualizando = false;
      }
    });
  }

  cerrarPrevisualizacion(): void {
    this.mostrandoPrevia = false;
    this.horarioPrevisualizado = [];
  }

  publicarGeneracion(): void {
    if (this.idGeneracionActual === null) {
      this.errorAccionHorario = 'No hay una generación reciente para publicar.';
      return;
    }

    this.publicando = true;
    this.errorAccionHorario = null;
    this.mensajeAccionHorario = null;

    this.horariosService.publicarGeneracion(this.idGeneracionActual).subscribe({
      next: () => {
        this.publicando = false;
        this.mostrandoPrevia = false;
        this.horarioPrevisualizado = [];
        this.mensajeAccionHorario = 'El horario se publicó correctamente.';

        this.refrescarHorarioVisible();
      },
      error: (err) => {
        this.errorAccionHorario = err?.error?.message ?? 'No se pudo publicar el horario.';
        this.publicando = false;
      }
    });
  }

  async eliminarGeneracion(): Promise<void> {
    if (this.idGeneracionActual === null) {
      this.errorAccionHorario = 'No hay una generación reciente para eliminar.';
      return;
    }

    const confirmado = await this.modalService.confirm(
      '¿Seguro quieres eliminar este horario?',
      'Eliminar horario',
      'Eliminar',
      'Cancelar'
    );

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.errorAccionHorario = null;
    this.mensajeAccionHorario = null;

    this.horariosService.eliminarGeneracion(this.idGeneracionActual).subscribe({
      next: () => {
        this.eliminando = false;
        this.mostrandoPrevia = false;
        this.horarioPrevisualizado = [];
        this.idGeneracionActual = null;
        this.mensajeAccionHorario = 'El horario se eliminó correctamente.';

        this.refrescarHorarioVisible();
      },
      error: (err) => {
        this.errorAccionHorario = err?.error?.message ?? 'No se pudo eliminar el horario.';
        this.eliminando = false;
      }
    });
  }
}