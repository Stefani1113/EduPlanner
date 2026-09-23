import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../core/components/pagination/pagination.component';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  DocentesService,
  TeachingResponseDTO
} from '../../services/docentes.service';

import {
  HorariosService,
  SubjectResponseDTO,
  AcademicTeacherResponseDTO,
  AcademicLoadResponseDTO,
  CourseResponseDTO,
  CourseRequestDTO,
  AcademicPeriodResponseDTO,
  AcademicPeriodRequestDTO,
  AcademicLevelResponseDTO,
  AcademicLevelRequestDTO,
  SchoolShiftResponseDTO,
  SchoolShiftRequestDTO,
  TimeSlotResponseDTO,
  TimeSlotRequestDTO,
  TeacherAvailabilityResponseDTO,
  TeacherAvailabilityRequestDTO
} from '../../services/registro.service';

import { ModalService } from '../../../../core/services/modal.service';

interface DocenteFila {
  idAcademicLoad: number;
  idAcademicTeacher: number;
  idUser: number;
  idCourse: number;
  idSubject: number;
  nombre: string;
  apellidos: string;
  photoUrl: string | null;
  area: string;
  curso: string;
  maxDailyHours: number;
  maxWeeklyHours: number;
  horasSemanaArea: number;
}

interface AsignaturaFila {
  idSubject: number;
  nombre: string;
  descripcion: string;
  color: string;
}

interface CursoFila {
  idCourse: number;
  idPeriod: number;
  idLevel: number;
  idShift: number;
  homeroomTeacher: number | null;
  nombre: string;
  docenteTitular: string;
  nivel: string;
  jornada: string;
  estudiantes: number;
}

interface NivelFila {
  idLevel: number;
  nombre: string;
  descripcion: string;
}

interface PeriodoFila {
  idPeriod: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

interface JornadaFila {
  idShift: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

interface FranjaFila {
  idTimeSlot: number;
  idShift: number;
  jornada: string;
  orden: number;
  horaInicio: string;
  horaFin: string;
  esDescanso: boolean;
}

interface DisponibilidadFila {
  idAvailability: number;
  idTeacher: number;
  docente: string;
  idTimeSlot: number;
  franja: string;
  diaSemana: number;
  diaNombre: string;
  disponible: boolean;
}

const DIAS_SEMANA = [
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' }
];

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {

  mostrarDatos = true;

  pestanaActivaDatos:
    'academico' | 'calendario' | 'disponibilidad' = 'academico';

  mostrarFormularioDocente = false;
  mostrarFormularioAsignatura = false;
  mostrarFormularioCurso = false;
  mostrarFormularioNivel = false;
  mostrarFormularioPeriodo = false;
  mostrarFormularioJornada = false;
  mostrarFormularioFranja = false;
  mostrarFormularioDisponibilidad = false;

  editandoDocente = false;
  editandoAsignatura = false;
  editandoCurso = false;
  editandoNivel = false;
  editandoPeriodo = false;
  editandoJornada = false;
  editandoFranja = false;
  editandoDisponibilidad = false;

  cargandoDatos = false;

  guardandoDocente = false;
  guardandoAsignatura = false;
  guardandoCurso = false;
  guardandoNivel = false;
  guardandoPeriodo = false;
  guardandoJornada = false;
  guardandoFranja = false;
  guardandoDisponibilidad = false;

  errorCarga = '';

  errorFormularioDocente = '';
  errorFormularioAsignatura = '';
  errorFormularioCurso = '';
  errorFormularioNivel = '';
  errorFormularioPeriodo = '';
  errorFormularioJornada = '';
  errorFormularioFranja = '';
  errorFormularioDisponibilidad = '';

  docentes: DocenteFila[] = [];
  asignaturas: AsignaturaFila[] = [];
  cursos: CursoFila[] = [];
  niveles: NivelFila[] = [];
  periodos: PeriodoFila[] = [];
  jornadas: JornadaFila[] = [];
  franjas: FranjaFila[] = [];
  disponibilidades: DisponibilidadFila[] = [];

  diasSemana = DIAS_SEMANA;

  readonly tamanoPagina = 10;

  paginaDocentes = 1;
  paginaAsignaturas = 1;
  paginaCursos = 1;
  paginaNiveles = 1;
  paginaPeriodos = 1;
  paginaJornadas = 1;
  paginaFranjas = 1;
  paginaDisponibilidades = 1;

 
  get totalDocentes(): number {
    return this.docentes.length;
  }

  get totalAsignaturas(): number {
    return this.asignaturas.length;
  }

  get totalCursos(): number {
    return this.cursos.length;
  }

  get totalNiveles(): number {
    return this.niveles.length;
  }

  get totalPeriodos(): number {
    return this.periodos.length;
  }

  get totalJornadas(): number {
    return this.jornadas.length;
  }

  get totalFranjas(): number {
    return this.franjas.length;
  }

  get totalDisponibilidades(): number {
    return this.disponibilidades.length;
  }

  get docentesPagina(): DocenteFila[] {
    return this.pagina(
      this.docentes,
      this.paginaDocentes
    );
  }

  get asignaturasPagina(): AsignaturaFila[] {
    return this.pagina(
      this.asignaturas,
      this.paginaAsignaturas
    );
  }

  get cursosPagina(): CursoFila[] {
    return this.pagina(
      this.cursos,
      this.paginaCursos
    );
  }

  get nivelesPagina(): NivelFila[] {
    return this.pagina(
      this.niveles,
      this.paginaNiveles
    );
  }

  get periodosPagina(): PeriodoFila[] {
    return this.pagina(
      this.periodos,
      this.paginaPeriodos
    );
  }

  get jornadasPagina(): JornadaFila[] {
    return this.pagina(
      this.jornadas,
      this.paginaJornadas
    );
  }

  get franjasPagina(): FranjaFila[] {
    return this.pagina(
      this.franjas,
      this.paginaFranjas
    );
  }

  get disponibilidadesPagina(): DisponibilidadFila[] {
    return this.pagina(
      this.disponibilidades,
      this.paginaDisponibilidades
    );
  }

  private pagina<T>(
    items: T[],
    pagina: number
  ): T[] {
    const paginaSegura = Math.max(
      1,
      pagina
    );

    const inicio =
      (paginaSegura - 1) * this.tamanoPagina;

    return items.slice(
      inicio,
      inicio + this.tamanoPagina
    );
  }

  reiniciarPaginas(): void {
    this.paginaDocentes = 1;
    this.paginaAsignaturas = 1;
    this.paginaCursos = 1;
    this.paginaNiveles = 1;
    this.paginaPeriodos = 1;
    this.paginaJornadas = 1;
    this.paginaFranjas = 1;
    this.paginaDisponibilidades = 1;
  }

  docenteSeleccionado: DocenteFila | null = null;
  asignaturaSeleccionada: AsignaturaFila | null = null;
  cursoSeleccionado: CursoFila | null = null;
  nivelSeleccionado: NivelFila | null = null;
  periodoSeleccionado: PeriodoFila | null = null;
  jornadaSeleccionada: JornadaFila | null = null;
  franjaSeleccionada: FranjaFila | null = null;
  disponibilidadSeleccionada:
    DisponibilidadFila | null = null;

  docentesDisponibles: TeachingResponseDTO[] = [];
  cursosDisponibles: CourseResponseDTO[] = [];
  asignaturasCatalogo: SubjectResponseDTO[] = [];
  periodosDisponibles: AcademicPeriodResponseDTO[] = [];
  nivelesDisponibles: AcademicLevelResponseDTO[] = [];
  jornadasDisponibles: SchoolShiftResponseDTO[] = [];
  franjasDisponibles: TimeSlotResponseDTO[] = [];
  academicTeachersCatalogo:
    AcademicTeacherResponseDTO[] = [];

  private academicTeachersPorUsuario =
    new Map<number, AcademicTeacherResponseDTO>();

  formularioDocente = {
    idAcademicLoad: 0,
    idUser: 0,
    idCourse: 0,
    idSubject: 0,
    maxDailyHours: 6,
    maxWeeklyHours: 30,
    horasSemanaArea: 0
  };

  formularioAsignatura = {
    idSubject: 0,
    nombre: '',
    descripcion: '',
    color: '#347d1c'
  };

  formularioCurso: {
    idCourse: number;
    idPeriod: number | null;
    idLevel: number;
    idShift: number;
    homeroomTeacher: number | null;
    nombre: string;
    estudiantes: number;
  } = {
    idCourse: 0,
    idPeriod: null,
    idLevel: 0,
    idShift: 0,
    homeroomTeacher: null,
    nombre: '',
    estudiantes: 0
  };

  formularioNivel = {
    idLevel: 0,
    nombre: '',
    descripcion: ''
  };

  formularioPeriodo = {
    idPeriod: 0,
    nombre: '',
    fechaInicio: '',
    fechaFin: ''
  };

  formularioJornada = {
    idShift: 0,
    nombre: '',
    horaInicio: '',
    horaFin: ''
  };

  formularioFranja = {
    idTimeSlot: 0,
    idShift: 0,
    orden: 1,
    horaInicio: '',
    horaFin: '',
    esDescanso: false
  };

  formularioDisponibilidad = {
    idAvailability: 0,
    idTeacher: 0,
    idTimeSlot: 0,
    diaSemana: 1,
    disponible: true
  };

  constructor(
    private horariosService: HorariosService,
    private docentesService: DocentesService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private extraerLista<T>(
    respuesta: any
  ): T[] {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (
      !respuesta ||
      typeof respuesta !== 'object'
    ) {
      return [];
    }

    if (Array.isArray(respuesta.data)) {
      return respuesta.data;
    }

    if (Array.isArray(respuesta.content)) {
      return respuesta.content;
    }

    if (Array.isArray(respuesta.items)) {
      return respuesta.items;
    }

    if (Array.isArray(respuesta.results)) {
      return respuesta.results;
    }

    if (
      respuesta.data &&
      typeof respuesta.data === 'object'
    ) {
      return this.extraerLista<T>(
        respuesta.data
      );
    }

    return [];
  }

  private mensajeErrorEliminacion(
    err: any,
    fallback: string
  ): string {
    const mensaje: string =
      err?.error?.message ||
      err?.error?.error ||
      '';

    const pareceViolacionDeIntegridad =
      /no se encontr[oó] en/i.test(mensaje) ||
      /foreign key/i.test(mensaje);

    if (pareceViolacionDeIntegridad) {
      return (
        'No se puede eliminar: todavía hay otros registros ' +
        'del sistema que dependen de este elemento. ' +
        'Elimina o reasigna esos registros primero e inténtalo de nuevo.'
      );
    }

    return mensaje || fallback;
  }

  cargarDatos(): void {
    this.cargandoDatos = true;
    this.errorCarga = '';

    forkJoin({
      docentes: this.docentesService.listar(),
      cursos: this.horariosService.listarCursos(),
      asignaturas:
        this.horariosService.listarAsignaturas(),
      academicTeachers:
        this.horariosService.listarDocentesAcademicos(),
      cargas:
        this.horariosService.listarCargasAcademicas(),
      periodos:
        this.horariosService.listarPeriodos(),
      niveles:
        this.horariosService.listarNiveles(),
      jornadas:
        this.horariosService.listarJornadas(),
      franjas:
        this.horariosService.listarFranjas(),
      disponibilidad:
        this.horariosService.listarDisponibilidad()
    }).subscribe({
      next: ({
        docentes,
        cursos,
        asignaturas,
        academicTeachers,
        cargas,
        periodos,
        niveles,
        jornadas,
        franjas,
        disponibilidad
      }) => {

        this.docentesDisponibles =
          this.extraerLista<TeachingResponseDTO>(
            docentes
          );

        this.cursosDisponibles =
          this.extraerLista<CourseResponseDTO>(
            cursos
          );

        this.asignaturasCatalogo =
          this.extraerLista<SubjectResponseDTO>(
            asignaturas
          );

        this.periodosDisponibles =
          this.extraerLista<AcademicPeriodResponseDTO>(
            periodos
          );

        this.nivelesDisponibles =
          this.extraerLista<AcademicLevelResponseDTO>(
            niveles
          );

        this.jornadasDisponibles =
          this.extraerLista<SchoolShiftResponseDTO>(
            jornadas
          );

        this.franjasDisponibles =
          this.extraerLista<TimeSlotResponseDTO>(
            franjas
          );

        const cargasDisponibles =
          this.extraerLista<AcademicLoadResponseDTO>(
            cargas
          );

        const disponibilidadData =
          this.extraerLista<TeacherAvailabilityResponseDTO>(
            disponibilidad
          );

        const academicTeachersData =
          this.extraerLista<AcademicTeacherResponseDTO>(
            academicTeachers
          );

        const docentesPorId =
          new Map<number, TeachingResponseDTO>(
            this.docentesDisponibles.map(
              docente => [
                docente.idUser,
                docente
              ]
            )
          );

        const cursosPorId =
          new Map<number, CourseResponseDTO>(
            this.cursosDisponibles.map(
              curso => [
                curso.idCourse,
                curso
              ]
            )
          );

        const asignaturasPorId =
          new Map<number, SubjectResponseDTO>(
            this.asignaturasCatalogo.map(
              asignatura => [
                asignatura.idSubject,
                asignatura
              ]
            )
          );

        this.academicTeachersCatalogo =
          academicTeachersData;

        this.academicTeachersPorUsuario =
          new Map<number, AcademicTeacherResponseDTO>(
            academicTeachersData.map(
              docente => [
                docente.idUser,
                docente
              ]
            )
          );

        const academicTeacherPorId =
          new Map<number, AcademicTeacherResponseDTO>(
            academicTeachersData.map(
              docente => [
                docente.idAcademicTeacher,
                docente
              ]
            )
          );

        this.asignaturas =
          this.asignaturasCatalogo.map(
            asignatura => ({
              idSubject:
                asignatura.idSubject,
              nombre:
                asignatura.name ?? '',
              descripcion:
                asignatura.description ?? '',
              color:
                asignatura.color ?? '#347d1c'
            })
          );

        this.cursos =
          this.cursosDisponibles.map(
            curso => {

              const academicTeacher =
                curso.homeroomTeacher !== null &&
                curso.homeroomTeacher !== undefined
                  ? academicTeacherPorId.get(
                      curso.homeroomTeacher
                    )
                  : undefined;

              const docenteTitular =
                academicTeacher
                  ? docentesPorId.get(
                      academicTeacher.idUser
                    )
                  : undefined;

              return {
                idCourse:
                  curso.idCourse,

                idPeriod:
                  Number(curso.idPeriod ?? 0),

                idLevel:
                  Number(curso.idLevel ?? 0),

                idShift:
                  Number(curso.idShift ?? 0),

                homeroomTeacher:
                  curso.homeroomTeacher ?? null,

                nombre:
                  curso.name ?? '',

                docenteTitular:
                  docenteTitular
                    ? `${docenteTitular.name ?? ''} ${
                        docenteTitular.surnames ?? ''
                      }`.trim()
                    : 'Sin asignar',

                nivel:
                  this.obtenerNombreNivel(
                    Number(curso.idLevel ?? 0)
                  ),

                jornada:
                  this.obtenerNombreJornada(
                    Number(curso.idShift ?? 0)
                  ),

                estudiantes:
                  Number(
                    curso.studentCount ?? 0
                  )
              };
            }
          );

        this.docentes =
          cargasDisponibles
            .map(carga => {

              const academicTeacher =
                academicTeacherPorId.get(
                  carga.idTeacher
                );

              if (!academicTeacher) {
                return null;
              }

              const docente =
                docentesPorId.get(
                  academicTeacher.idUser
                );

              if (!docente) {
                return null;
              }

              const curso =
                cursosPorId.get(
                  carga.idCourse
                );

              const asignatura =
                asignaturasPorId.get(
                  carga.idSubject
                );

              return {
                idAcademicLoad:
                  carga.idAcademicLoad,

                idAcademicTeacher:
                  academicTeacher.idAcademicTeacher,

                idUser:
                  academicTeacher.idUser,

                idCourse:
                  carga.idCourse,

                idSubject:
                  carga.idSubject,

                nombre:
                  docente.name ?? '',

                apellidos:
                  docente.surnames ?? '',

                photoUrl:
                  docente.photoUrl ?? null,

                area:
                  asignatura
                    ? (
                        asignatura.name ??
                        'Asignatura sin nombre'
                      )
                    : 'Asignatura no encontrada',

                curso:
                  curso
                    ? (
                        curso.name ??
                        'Curso sin nombre'
                      )
                    : `Curso #${carga.idCourse}`,

                maxDailyHours:
                  academicTeacher.maxDailyHours ?? 0,

                maxWeeklyHours:
                  academicTeacher.maxWeeklyHours ?? 0,

                horasSemanaArea:
                  carga.weeklyHours ?? 0
              } as DocenteFila;
            })
            .filter(
              (
                fila
              ): fila is DocenteFila =>
                fila !== null
            );

        this.niveles =
          this.nivelesDisponibles.map(
            nivel => ({
              idLevel:
                nivel.idLevel,
              nombre:
                nivel.name ?? '',
              descripcion:
                nivel.description ?? ''
            })
          );

        this.periodos =
          this.periodosDisponibles.map(
            periodo => ({
              idPeriod:
                periodo.idPeriod,
              nombre:
                periodo.name ?? '',
              fechaInicio:
                periodo.startDate ?? '',
              fechaFin:
                periodo.endDate ?? ''
            })
          );

        this.jornadas =
          this.jornadasDisponibles.map(
            jornada => ({
              idShift:
                jornada.idShift,
              nombre:
                jornada.name ?? '',
              horaInicio:
                jornada.startTime ?? '',
              horaFin:
                jornada.endTime ?? ''
            })
          );

        const jornadasPorId =
          new Map<number, SchoolShiftResponseDTO>(
            this.jornadasDisponibles.map(
              jornada => [
                jornada.idShift,
                jornada
              ]
            )
          );

        this.franjas =
          this.franjasDisponibles.map(
            franja => ({
              idTimeSlot:
                franja.idTimeSlot,

              idShift:
                franja.idShift,

              jornada:
                jornadasPorId.get(
                  franja.idShift
                )?.name ??
                `Jornada ${franja.idShift}`,

              orden:
                franja.slotOrder,

              horaInicio:
                franja.startTime ?? '',

              horaFin:
                franja.endTime ?? '',

              esDescanso:
                !!franja.isBreak
            })
          );

        const franjasPorId =
          new Map<number, TimeSlotResponseDTO>(
            this.franjasDisponibles.map(
              franja => [
                franja.idTimeSlot,
                franja
              ]
            )
          );

        this.disponibilidades =
          disponibilidadData.map(
            item => {

              const academicTeacher =
                academicTeacherPorId.get(
                  item.idTeacher
                );

              const docente =
                academicTeacher
                  ? docentesPorId.get(
                      academicTeacher.idUser
                    )
                  : undefined;

              const franja =
                franjasPorId.get(
                  item.idTimeSlot
                );

              const diaNombre =
                DIAS_SEMANA.find(
                  dia =>
                    dia.valor === item.dayOfWeek
                )?.nombre ??
                `Día ${item.dayOfWeek}`;

              return {
                idAvailability:
                  item.idAvailability,

                idTeacher:
                  item.idTeacher,

                docente:
                  docente
                    ? `${docente.name ?? ''} ${
                        docente.surnames ?? ''
                      }`.trim()
                    : `Docente #${item.idTeacher}`,

                idTimeSlot:
                  item.idTimeSlot,

                franja:
                  franja
                    ? `${franja.startTime ?? ''} - ${
                        franja.endTime ?? ''
                      }`
                    : `Franja #${item.idTimeSlot}`,

                diaSemana:
                  item.dayOfWeek,

                diaNombre,

                disponible:
                  item.available
              };
            }
          );

        this.reiniciarPaginas();
        this.cargandoDatos = false;
      },

      error: err => {
        console.error(
          'Error cargando datos:',
          err
        );

        this.cargandoDatos = false;

        this.errorCarga =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo cargar la información desde el servidor.';
      }
    });
  }

  obtenerNombreNivel(
    idLevel: number
  ): string {
    return (
      this.nivelesDisponibles.find(
        nivel =>
          nivel.idLevel === idLevel
      )?.name ??
      `Nivel ${idLevel}`
    );
  }

  obtenerNombreJornada(
    idShift: number
  ): string {
    return (
      this.jornadasDisponibles.find(
        jornada =>
          jornada.idShift === idShift
      )?.name ??
      `Jornada ${idShift}`
    );
  }

  nombreDocenteAcademico(
    academico: AcademicTeacherResponseDTO
  ): string {
    const docente =
      this.docentesDisponibles.find(
        d =>
          d.idUser === academico.idUser
      );

    return docente
      ? `${docente.name ?? ''} ${
          docente.surnames ?? ''
        }`.trim()
      : `Docente #${academico.idUser}`;
  }

  cambiarPestanaDatos(
    pestana:
      'academico' |
      'calendario' |
      'disponibilidad'
  ): void {
    this.pestanaActivaDatos = pestana;
  }

  seleccionarDocente(
    docente: DocenteFila
  ): void {
    this.docenteSeleccionado = docente;
  }

  private refrescarCursosDisponibles(): void {
    this.horariosService
      .listarCursos()
      .subscribe({
        next: respuesta => {
          this.cursosDisponibles =
            this.extraerLista<CourseResponseDTO>(
              respuesta
            );
        },

        error: err => {
          console.error(
            'No se pudo refrescar la lista de cursos:',
            err
          );
        }
      });
  }

  abrirAgregarDocente(): void {
    this.editandoDocente = false;
    this.errorFormularioDocente = '';

    this.formularioDocente = {
      idAcademicLoad: 0,
      idUser: 0,
      idCourse: 0,
      idSubject: 0,
      maxDailyHours: 6,
      maxWeeklyHours: 30,
      horasSemanaArea: 0
    };

    this.refrescarCursosDisponibles();
    this.mostrarFormularioDocente = true;
  }

  abrirEditarDocente(): void {
    if (!this.docenteSeleccionado) {
      return;
    }

    this.editandoDocente = true;
    this.errorFormularioDocente = '';

    const docente =
      this.docenteSeleccionado;

    this.formularioDocente = {
      idAcademicLoad:
        docente.idAcademicLoad,

      idUser:
        docente.idUser,

      idCourse:
        docente.idCourse,

      idSubject:
        docente.idSubject,

      maxDailyHours:
        docente.maxDailyHours,

      maxWeeklyHours:
        docente.maxWeeklyHours,

      horasSemanaArea:
        docente.horasSemanaArea
    };

    this.refrescarCursosDisponibles();
    this.mostrarFormularioDocente = true;
  }

  cerrarFormularioDocente(): void {
    if (!this.guardandoDocente) {
      this.mostrarFormularioDocente = false;
    }
  }

  guardarDocente(): void {
    this.errorFormularioDocente = '';

    const formulario =
      this.formularioDocente;

    if (
      !formulario.idUser ||
      !formulario.idCourse ||
      !formulario.idSubject ||
      !formulario.maxDailyHours ||
      !formulario.maxWeeklyHours
    ) {
      this.errorFormularioDocente =
        'Completa todos los campos obligatorios.';
      return;
    }

    if (
      !this.cursosDisponibles.some(
        curso =>
          curso.idCourse ===
          formulario.idCourse
      )
    ) {
      this.errorFormularioDocente =
        'El curso seleccionado ya no existe o fue eliminado. Vuelve a abrir este formulario para actualizar la lista de cursos.';
      return;
    }

    if (
      formulario.maxDailyHours <= 0 ||
      formulario.maxDailyHours > 24
    ) {
      this.errorFormularioDocente =
        'Las horas máximas diarias deben estar entre 1 y 24.';
      return;
    }

    if (
      formulario.maxWeeklyHours <= 0 ||
      formulario.maxWeeklyHours > 168
    ) {
      this.errorFormularioDocente =
        'Las horas máximas semanales no son válidas.';
      return;
    }

    this.guardandoDocente = true;

    const academicTeacherExistente =
      this.academicTeachersPorUsuario.get(
        formulario.idUser
      );

    const guardarDocenteAcademico$ =
      academicTeacherExistente
        ? this.horariosService.actualizarDocenteAcademico(
            academicTeacherExistente.idAcademicTeacher,
            {
              idUser:
                formulario.idUser,
              maxDailyHours:
                formulario.maxDailyHours,
              maxWeeklyHours:
                formulario.maxWeeklyHours
            }
          )
        : this.horariosService.crearDocenteAcademico({
            idUser:
              formulario.idUser,
            maxDailyHours:
              formulario.maxDailyHours,
            maxWeeklyHours:
              formulario.maxWeeklyHours
          });

    guardarDocenteAcademico$.subscribe({
      next: respuesta => {

        const idAcademicTeacher =
          respuesta?.data?.idAcademicTeacher ??
          academicTeacherExistente?.idAcademicTeacher;

        if (!idAcademicTeacher) {
          this.guardandoDocente = false;

          this.errorFormularioDocente =
            'El backend no devolvió el ID del docente académico.';

          return;
        }

        const carga = {
          idTeacher:
            idAcademicTeacher,

          idCourse:
            formulario.idCourse,

          idSubject:
            formulario.idSubject,

          weeklyHours:
            formulario.horasSemanaArea > 0
              ? formulario.horasSemanaArea
              : 1
        };

        const guardarCarga$ =
          this.editandoDocente
            ? this.horariosService.actualizarCargaAcademica(
                formulario.idAcademicLoad,
                carga
              )
            : this.horariosService.crearCargaAcademica(
                carga
              );

        guardarCarga$.subscribe({
          next: () => {

            this.guardandoDocente = false;
            this.mostrarFormularioDocente = false;
            this.docenteSeleccionado = null;

            this.cargarDatos();

            this.modalService.success(
              this.editandoDocente
                ? 'La asignación del docente se actualizó correctamente.'
                : 'La asignación del docente se agregó correctamente.'
            );
          },

          error: err => {
            console.error(
              'Error guardando carga:',
              err
            );

            this.guardandoDocente = false;

            this.errorFormularioDocente =
              err?.error?.message ||
              err?.error?.error ||
              'No se pudo guardar la asignación del docente.';
          }
        });
      },

      error: err => {
        console.error(
          'Error guardando docente académico:',
          err
        );

        this.guardandoDocente = false;

        this.errorFormularioDocente =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo guardar el docente académico.';
      }
    });
  }

  async eliminarDocente(): Promise<void> {
    if (!this.docenteSeleccionado) {
      return;
    }

    const docente =
      this.docenteSeleccionado;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas quitar la asignación de "${docente.area}" a ${docente.nombre} ${docente.apellidos}?`,
        'Quitar asignación'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarCargaAcademica(
        docente.idAcademicLoad
      )
      .subscribe({
        next: () => {

          this.docentes =
            this.docentes.filter(
              item =>
                item.idAcademicLoad !==
                docente.idAcademicLoad
            );

          this.docenteSeleccionado = null;
        },

        error: err => {
          console.error(
            'Error eliminando carga:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar la asignación.'
            )
          );
        }
      });
  }

  seleccionarAsignatura(
    asignatura: AsignaturaFila
  ): void {
    this.asignaturaSeleccionada =
      asignatura;
  }

  abrirAgregarAsignatura(): void {
    this.editandoAsignatura = false;
    this.errorFormularioAsignatura = '';

    this.formularioAsignatura = {
      idSubject: 0,
      nombre: '',
      descripcion: '',
      color: '#347d1c'
    };

    this.mostrarFormularioAsignatura = true;
  }

  abrirEditarAsignatura(): void {
    if (!this.asignaturaSeleccionada) {
      return;
    }

    this.editandoAsignatura = true;
    this.errorFormularioAsignatura = '';

    this.formularioAsignatura = {
      ...this.asignaturaSeleccionada
    };

    this.mostrarFormularioAsignatura = true;
  }

  cerrarFormularioAsignatura(): void {
    if (!this.guardandoAsignatura) {
      this.mostrarFormularioAsignatura = false;
    }
  }

  guardarAsignatura(): void {
    this.errorFormularioAsignatura = '';

    const nombre =
      this.formularioAsignatura.nombre.trim();

    const descripcion =
      this.formularioAsignatura.descripcion.trim();

    const color =
      this.formularioAsignatura.color ||
      '#347d1c';

    if (!nombre) {
      this.errorFormularioAsignatura =
        'El nombre de la asignatura es obligatorio.';
      return;
    }

    this.guardandoAsignatura = true;

    const dto = {
      name: nombre,
      description: descripcion,
      color
    };

    const peticion =
      this.editandoAsignatura
        ? this.horariosService.actualizarAsignatura(
            this.formularioAsignatura.idSubject,
            dto
          )
        : this.horariosService.crearAsignatura(
            dto
          );

    peticion.subscribe({
      next: () => {

        this.guardandoAsignatura = false;
        this.mostrarFormularioAsignatura = false;
        this.asignaturaSeleccionada = null;

        this.cargarDatos();

        this.modalService.success(
          this.editandoAsignatura
            ? 'La asignatura se actualizó correctamente.'
            : 'La asignatura se agregó correctamente.'
        );
      },

      error: err => {
        console.error(
          'Error guardando asignatura:',
          err
        );

        this.guardandoAsignatura = false;

        this.errorFormularioAsignatura =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo guardar la asignatura.';
      }
    });
  }

  async eliminarAsignatura(): Promise<void> {
    if (!this.asignaturaSeleccionada) {
      return;
    }

    const asignatura =
      this.asignaturaSeleccionada;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas eliminar ${asignatura.nombre}?`,
        'Eliminar asignatura'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .listarCargasAcademicas()
      .subscribe({
        next: async respuesta => {

          const cargasRelacionadas =
            this.extraerLista<AcademicLoadResponseDTO>(
              respuesta
            ).filter(
              carga =>
                carga.idSubject ===
                asignatura.idSubject
            );

          if (
            cargasRelacionadas.length > 0
          ) {
            const confirmarCascada =
              await this.modalService.confirm(
                `"${asignatura.nombre}" está asignada a ${cargasRelacionadas.length} docente(s)/curso(s) en carga académica. Si continúas, también se eliminarán esas asignaciones. ¿Deseas continuar?`,
                'La asignatura está en uso'
              );

            if (!confirmarCascada) {
              return;
            }
          }

          this.ejecutarEliminarAsignatura(
            asignatura,
            cargasRelacionadas
          );
        },

        error: err => {
          console.error(
            'No se pudo verificar si la asignatura está en uso:',
            err
          );

          this.modalService.error(
            'No se pudo verificar si la asignatura está en uso. Inténtalo de nuevo.'
          );
        }
      });
  }

  private ejecutarEliminarAsignatura(
    asignatura: AsignaturaFila,
    cargasRelacionadas: AcademicLoadResponseDTO[]
  ): void {

    const eliminacionesCargas =
      cargasRelacionadas.map(
        carga =>
          this.horariosService.eliminarCargaAcademica(
            carga.idAcademicLoad
          )
      );

    const pasoPrevio$ =
      forkJoin(eliminacionesCargas);

    pasoPrevio$
      .pipe(
        switchMap(() =>
          this.horariosService.eliminarAsignatura(
            asignatura.idSubject
          )
        )
      )
      .subscribe({
        next: () => {

          this.asignaturas =
            this.asignaturas.filter(
              item =>
                item.idSubject !==
                asignatura.idSubject
            );

          this.asignaturasCatalogo =
            this.asignaturasCatalogo.filter(
              item =>
                item.idSubject !==
                asignatura.idSubject
            );

          this.asignaturaSeleccionada = null;

          this.cargarDatos();

          this.modalService.success(
            'La asignatura se eliminó correctamente.'
          );
        },

        error: err => {
          console.error(
            'Error eliminando asignatura:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar la asignatura.'
            )
          );
        }
      });
  }

  seleccionarCurso(
    curso: CursoFila
  ): void {
    this.cursoSeleccionado = curso;
  }

  abrirAgregarCurso(): void {
    this.editandoCurso = false;
    this.errorFormularioCurso = '';

    const primerPeriodoDisponible =
      this.periodosDisponibles[0]?.idPeriod ??
      null;

    const primerNivelDisponible =
      this.nivelesDisponibles[0]?.idLevel ??
      0;

    const primeraJornadaDisponible =
      this.jornadasDisponibles[0]?.idShift ??
      0;

    this.formularioCurso = {
      idCourse: 0,
      idPeriod: primerPeriodoDisponible,
      idLevel: primerNivelDisponible,
      idShift: primeraJornadaDisponible,
      homeroomTeacher: null,
      nombre: '',
      estudiantes: 0
    };

    this.mostrarFormularioCurso = true;
  }

  abrirEditarCurso(): void {
    if (!this.cursoSeleccionado) {
      return;
    }

    this.editandoCurso = true;
    this.errorFormularioCurso = '';

    const curso =
      this.cursoSeleccionado;

    this.formularioCurso = {
      idCourse:
        curso.idCourse,

      idPeriod:
        curso.idPeriod ?? null,

      idLevel:
        curso.idLevel,

      idShift:
        curso.idShift,

      homeroomTeacher:
        curso.homeroomTeacher,

      nombre:
        curso.nombre ?? '',

      estudiantes:
        curso.estudiantes
    };

    this.mostrarFormularioCurso = true;
  }

  cerrarFormularioCurso(): void {
    if (!this.guardandoCurso) {
      this.mostrarFormularioCurso = false;
    }
  }

  guardarCurso(): void {
    this.errorFormularioCurso = '';

    const formulario =
      this.formularioCurso;

    const nombre =
      (formulario.nombre ?? '').trim();

    if (!nombre) {
      this.errorFormularioCurso =
        'El nombre del curso es obligatorio.';
      return;
    }

    if (formulario.idPeriod === null) {
      this.errorFormularioCurso =
        'Selecciona un período académico.';
      return;
    }

    const idPeriod =
      Number(formulario.idPeriod);

    const idLevel =
      Number(formulario.idLevel);

    const idShift =
      Number(formulario.idShift);

    const estudiantes =
      Number(formulario.estudiantes);

    if (
      !Number.isInteger(idPeriod) ||
      idPeriod <= 0
    ) {
      this.errorFormularioCurso =
        'Selecciona un período académico válido.';
      return;
    }

    if (
      this.periodosDisponibles.length > 0 &&
      !this.periodosDisponibles.some(
        periodo =>
          periodo.idPeriod === idPeriod
      )
    ) {
      this.errorFormularioCurso =
        'El período seleccionado no existe. Selecciona un período válido.';
      return;
    }

    if (
      !this.nivelesDisponibles.some(
        nivel =>
          nivel.idLevel === idLevel
      )
    ) {
      this.errorFormularioCurso =
        'Selecciona un nivel válido.';
      return;
    }

    if (
      !this.jornadasDisponibles.some(
        jornada =>
          jornada.idShift === idShift
      )
    ) {
      this.errorFormularioCurso =
        'Selecciona una jornada válida.';
      return;
    }

    if (
      !Number.isInteger(estudiantes) ||
      estudiantes < 0 ||
      estudiantes > 32767
    ) {
      this.errorFormularioCurso =
        'La cantidad de estudiantes debe estar entre 0 y 32.767.';
      return;
    }

    const idUserHomeroomTeacher =
      formulario.homeroomTeacher !== null &&
      Number(formulario.homeroomTeacher) > 0
        ? Number(formulario.homeroomTeacher)
        : null;

    let homeroomTeacher:
      number | null = null;

    if (
      idUserHomeroomTeacher !== null
    ) {
      const academicTeacher =
        this.academicTeachersPorUsuario.get(
          idUserHomeroomTeacher
        );

      if (!academicTeacher) {
        this.errorFormularioCurso =
          'El docente seleccionado todavía no está registrado como docente académico. Regístralo primero antes de asignarlo como titular.';
        return;
      }

      homeroomTeacher =
        academicTeacher.idAcademicTeacher;
    }

    const dto: CourseRequestDTO = {
      idPeriod,
      idLevel,
      idShift,
      homeroomTeacher,
      name: nombre,
      studentCount: estudiantes
    };

    console.log(
      'CURSO QUE SE ENVÍA AL BACKEND:',
      JSON.stringify(dto, null, 2)
    );

    this.guardandoCurso = true;

    const peticion =
      this.editandoCurso
        ? this.horariosService.actualizarCurso(
            formulario.idCourse,
            dto
          )
        : this.horariosService.crearCurso(
            dto
          );

    peticion.subscribe({
      next: respuesta => {

        console.log(
          'Curso guardado correctamente:',
          respuesta
        );

        this.guardandoCurso = false;
        this.mostrarFormularioCurso = false;
        this.cursoSeleccionado = null;

        this.cargarDatos();

        this.modalService.success(
          this.editandoCurso
            ? 'El curso se actualizó correctamente.'
            : 'El curso se agregó correctamente.'
        );
      },

      error: err => {

        this.guardandoCurso = false;

        console.error(
          'ERROR AL GUARDAR CURSO',
          err
        );

        let mensaje = '';

        if (
          typeof err?.error === 'string'
        ) {
          mensaje = err.error;
        } else if (
          err?.error?.message
        ) {
          mensaje = err.error.message;
        } else if (
          err?.error?.error
        ) {
          mensaje = err.error.error;
        } else if (
          err?.message
        ) {
          mensaje = err.message;
        }

        const mensajeLower =
          mensaje.toLowerCase();

        if (
          mensajeLower.includes(
            'fk_course_period'
          ) ||
          mensajeLower.includes(
            'academic_period'
          ) ||
          mensajeLower.includes(
            'foreign key'
          )
        ) {
          this.errorFormularioCurso =
            'El período seleccionado no existe. Selecciona un período válido.';
        } else if (
          err?.status === 500
        ) {
          this.errorFormularioCurso =
            mensaje ||
            'El servidor no pudo registrar el curso.';
        } else if (
          err?.status === 400
        ) {
          this.errorFormularioCurso =
            mensaje ||
            'Los datos del curso no son válidos.';
        } else if (
          err?.status === 401
        ) {
          this.errorFormularioCurso =
            'Tu sesión ha expirado. Inicia sesión nuevamente.';
        } else {
          this.errorFormularioCurso =
            mensaje ||
            'No se pudo guardar el curso. Inténtalo nuevamente.';
        }
      }
    });
  }

  async eliminarCurso(): Promise<void> {
    if (!this.cursoSeleccionado) {
      return;
    }

    const curso =
      this.cursoSeleccionado;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas eliminar el curso ${curso.nombre}?`,
        'Eliminar curso'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarCurso(curso.idCourse)
      .subscribe({
        next: () => {

          this.cursos =
            this.cursos.filter(
              item =>
                item.idCourse !==
                curso.idCourse
            );

          this.cursosDisponibles =
            this.cursosDisponibles.filter(
              item =>
                item.idCourse !==
                curso.idCourse
            );

          this.cursoSeleccionado = null;
        },

        error: err => {
          console.error(
            'Error eliminando curso:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar el curso.'
            )
          );
        }
      });
  }

  seleccionarNivel(
    nivel: NivelFila
  ): void {
    this.nivelSeleccionado = nivel;
  }

  abrirAgregarNivel(): void {
    this.editandoNivel = false;
    this.errorFormularioNivel = '';

    this.formularioNivel = {
      idLevel: 0,
      nombre: '',
      descripcion: ''
    };

    this.mostrarFormularioNivel = true;
  }

  abrirEditarNivel(): void {
    if (!this.nivelSeleccionado) {
      return;
    }

    this.editandoNivel = true;
    this.errorFormularioNivel = '';

    const nivel =
      this.nivelSeleccionado;

    this.formularioNivel = {
      idLevel:
        nivel.idLevel,

      nombre:
        nivel.nombre,

      descripcion:
        nivel.descripcion
    };

    this.mostrarFormularioNivel = true;
  }

  cerrarFormularioNivel(): void {
    if (!this.guardandoNivel) {
      this.mostrarFormularioNivel = false;
    }
  }

  guardarNivel(): void {
    this.errorFormularioNivel = '';

    const nombre =
      this.formularioNivel.nombre.trim();

    if (!nombre) {
      this.errorFormularioNivel =
        'El nombre del nivel es obligatorio.';
      return;
    }

    this.guardandoNivel = true;

    const dto: AcademicLevelRequestDTO = {
      name: nombre,
      description:
        this.formularioNivel.descripcion.trim()
    };

    const peticion =
      this.editandoNivel
        ? this.horariosService.actualizarNivel(
            this.formularioNivel.idLevel,
            dto
          )
        : this.horariosService.crearNivel(
            dto
          );

    peticion.subscribe({
      next: () => {

        this.guardandoNivel = false;
        this.mostrarFormularioNivel = false;
        this.nivelSeleccionado = null;

        this.cargarDatos();

        this.modalService.success(
          this.editandoNivel
            ? 'El nivel académico se actualizó correctamente.'
            : 'El nivel académico se agregó correctamente.'
        );
      },

      error: err => {
        console.error(
          'Error guardando nivel:',
          err
        );

        this.guardandoNivel = false;

        this.errorFormularioNivel =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo guardar el nivel académico.';
      }
    });
  }

  async eliminarNivel(): Promise<void> {
    if (!this.nivelSeleccionado) {
      return;
    }

    const nivel =
      this.nivelSeleccionado;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas eliminar el nivel ${nivel.nombre}?`,
        'Eliminar nivel académico'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarNivel(nivel.idLevel)
      .subscribe({
        next: () => {

          this.niveles =
            this.niveles.filter(
              item =>
                item.idLevel !==
                nivel.idLevel
            );

          this.nivelesDisponibles =
            this.nivelesDisponibles.filter(
              item =>
                item.idLevel !==
                nivel.idLevel
            );

          this.nivelSeleccionado = null;
        },

        error: err => {
          console.error(
            'Error eliminando nivel:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar el nivel académico.'
            )
          );
        }
      });
  }

  seleccionarPeriodo(
    periodo: PeriodoFila
  ): void {
    this.periodoSeleccionado = periodo;
  }

  abrirAgregarPeriodo(): void {
    this.editandoPeriodo = false;
    this.errorFormularioPeriodo = '';

    this.formularioPeriodo = {
      idPeriod: 0,
      nombre: '',
      fechaInicio: '',
      fechaFin: ''
    };

    this.mostrarFormularioPeriodo = true;
  }

  abrirEditarPeriodo(): void {
    if (!this.periodoSeleccionado) {
      return;
    }

    this.editandoPeriodo = true;
    this.errorFormularioPeriodo = '';

    const periodo =
      this.periodoSeleccionado;

    this.formularioPeriodo = {
      idPeriod:
        periodo.idPeriod,

      nombre:
        periodo.nombre,

      fechaInicio:
        periodo.fechaInicio,

      fechaFin:
        periodo.fechaFin
    };

    this.mostrarFormularioPeriodo = true;
  }

  cerrarFormularioPeriodo(): void {
    if (!this.guardandoPeriodo) {
      this.mostrarFormularioPeriodo = false;
    }
  }

  guardarPeriodo(): void {
    this.errorFormularioPeriodo = '';

    const formulario =
      this.formularioPeriodo;

    const nombre =
      formulario.nombre.trim();

    if (!nombre) {
      this.errorFormularioPeriodo =
        'El nombre del período es obligatorio.';
      return;
    }

    if (
      !formulario.fechaInicio ||
      !formulario.fechaFin
    ) {
      this.errorFormularioPeriodo =
        'Las fechas de inicio y fin son obligatorias.';
      return;
    }

    if (
      formulario.fechaFin <
      formulario.fechaInicio
    ) {
      this.errorFormularioPeriodo =
        'La fecha de fin no puede ser anterior a la fecha de inicio.';
      return;
    }

    this.guardandoPeriodo = true;

    const dto: AcademicPeriodRequestDTO = {
      name: nombre,
      startDate:
        formulario.fechaInicio,
      endDate:
        formulario.fechaFin
    };

    const peticion =
      this.editandoPeriodo
        ? this.horariosService.actualizarPeriodo(
            formulario.idPeriod,
            dto
          )
        : this.horariosService.crearPeriodo(
            dto
          );

    peticion.subscribe({
      next: () => {

        this.guardandoPeriodo = false;
        this.mostrarFormularioPeriodo = false;
        this.periodoSeleccionado = null;

        this.cargarDatos();

        this.modalService.success(
          this.editandoPeriodo
            ? 'El período académico se actualizó correctamente.'
            : 'El período académico se agregó correctamente.'
        );
      },

      error: err => {
        console.error(
          'Error guardando período:',
          err
        );

        this.guardandoPeriodo = false;

        this.errorFormularioPeriodo =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo guardar el período académico.';
      }
    });
  }

  async eliminarPeriodo(): Promise<void> {
    if (!this.periodoSeleccionado) {
      return;
    }

    const periodo =
      this.periodoSeleccionado;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas eliminar el período ${periodo.nombre}?`,
        'Eliminar período académico'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarPeriodo(periodo.idPeriod)
      .subscribe({
        next: () => {

          this.periodos =
            this.periodos.filter(
              item =>
                item.idPeriod !==
                periodo.idPeriod
            );

          this.periodosDisponibles =
            this.periodosDisponibles.filter(
              item =>
                item.idPeriod !==
                periodo.idPeriod
            );

          this.periodoSeleccionado = null;
        },

        error: err => {
          console.error(
            'Error eliminando período:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar el período académico.'
            )
          );
        }
      });
  }

  seleccionarJornada(
    jornada: JornadaFila
  ): void {
    this.jornadaSeleccionada = jornada;
  }

  abrirAgregarJornada(): void {
    this.editandoJornada = false;
    this.errorFormularioJornada = '';

    this.formularioJornada = {
      idShift: 0,
      nombre: '',
      horaInicio: '',
      horaFin: ''
    };

    this.mostrarFormularioJornada = true;
  }

  abrirEditarJornada(): void {
    if (!this.jornadaSeleccionada) {
      return;
    }

    this.editandoJornada = true;
    this.errorFormularioJornada = '';

    const jornada =
      this.jornadaSeleccionada;

    this.formularioJornada = {
      idShift:
        jornada.idShift,

      nombre:
        jornada.nombre,

      horaInicio:
        jornada.horaInicio,

      horaFin:
        jornada.horaFin
    };

    this.mostrarFormularioJornada = true;
  }

  cerrarFormularioJornada(): void {
    if (!this.guardandoJornada) {
      this.mostrarFormularioJornada = false;
    }
  }

  guardarJornada(): void {
    this.errorFormularioJornada = '';

    const formulario =
      this.formularioJornada;

    const nombre =
      formulario.nombre.trim();

    if (!nombre) {
      this.errorFormularioJornada =
        'El nombre de la jornada es obligatorio.';
      return;
    }

    if (
      !formulario.horaInicio ||
      !formulario.horaFin
    ) {
      this.errorFormularioJornada =
        'Las horas de inicio y fin son obligatorias.';
      return;
    }

    this.guardandoJornada = true;

    const dto: SchoolShiftRequestDTO = {
      name: nombre,
      startTime:
        formulario.horaInicio,
      endTime:
        formulario.horaFin
    };

    const peticion =
      this.editandoJornada
        ? this.horariosService.actualizarJornada(
            formulario.idShift,
            dto
          )
        : this.horariosService.crearJornada(
            dto
          );

    peticion.subscribe({
      next: () => {

        this.guardandoJornada = false;
        this.mostrarFormularioJornada = false;
        this.jornadaSeleccionada = null;

        this.cargarDatos();

        this.modalService.success(
          this.editandoJornada
            ? 'La jornada académica se actualizó correctamente.'
            : 'La jornada académica se agregó correctamente.'
        );
      },

      error: err => {
        console.error(
          'Error guardando jornada:',
          err
        );

        this.guardandoJornada = false;

        this.errorFormularioJornada =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo guardar la jornada académica.';
      }
    });
  }

  async eliminarJornada(): Promise<void> {
    if (!this.jornadaSeleccionada) {
      return;
    }

    const jornada =
      this.jornadaSeleccionada;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas eliminar la jornada ${jornada.nombre}?`,
        'Eliminar jornada académica'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarJornada(jornada.idShift)
      .subscribe({
        next: () => {

          this.jornadas =
            this.jornadas.filter(
              item =>
                item.idShift !==
                jornada.idShift
            );

          this.jornadasDisponibles =
            this.jornadasDisponibles.filter(
              item =>
                item.idShift !==
                jornada.idShift
            );

          this.jornadaSeleccionada = null;
        },

        error: err => {
          console.error(
            'Error eliminando jornada:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar la jornada académica.'
            )
          );
        }
      });
  }

  seleccionarFranja(
    franja: FranjaFila
  ): void {
    this.franjaSeleccionada = franja;
  }

  abrirAgregarFranja(): void {
    this.editandoFranja = false;
    this.errorFormularioFranja = '';

    this.formularioFranja = {
      idTimeSlot: 0,

      idShift:
        this.jornadasDisponibles[0]?.idShift ??
        0,

      orden: 1,
      horaInicio: '',
      horaFin: '',
      esDescanso: false
    };

    this.mostrarFormularioFranja = true;
  }

  abrirEditarFranja(): void {
    if (!this.franjaSeleccionada) {
      return;
    }

    this.editandoFranja = true;
    this.errorFormularioFranja = '';

    const franja =
      this.franjaSeleccionada;

    this.formularioFranja = {
      idTimeSlot:
        franja.idTimeSlot,

      idShift:
        franja.idShift,

      orden:
        franja.orden,

      horaInicio:
        franja.horaInicio,

      horaFin:
        franja.horaFin,

      esDescanso:
        franja.esDescanso
    };

    this.mostrarFormularioFranja = true;
  }

  cerrarFormularioFranja(): void {
    if (!this.guardandoFranja) {
      this.mostrarFormularioFranja = false;
    }
  }

  guardarFranja(): void {
    this.errorFormularioFranja = '';

    const formulario =
      this.formularioFranja;

    if (!formulario.idShift) {
      this.errorFormularioFranja =
        'Selecciona la jornada a la que pertenece la franja.';
      return;
    }

    if (
      !formulario.orden ||
      formulario.orden <= 0
    ) {
      this.errorFormularioFranja =
        'El orden del bloque debe ser mayor que 0.';
      return;
    }

    if (
      !formulario.horaInicio ||
      !formulario.horaFin
    ) {
      this.errorFormularioFranja =
        'Las horas de inicio y fin son obligatorias.';
      return;
    }

    this.guardandoFranja = true;

    const dto: TimeSlotRequestDTO = {
      idShift:
        Number(formulario.idShift),

      slotOrder:
        Number(formulario.orden),

      startTime:
        formulario.horaInicio,

      endTime:
        formulario.horaFin,

      isBreak:
        formulario.esDescanso
    };

    const peticion =
      this.editandoFranja
        ? this.horariosService.actualizarFranja(
            formulario.idTimeSlot,
            dto
          )
        : this.horariosService.crearFranja(
            dto
          );

    peticion.subscribe({
      next: () => {

        this.guardandoFranja = false;
        this.mostrarFormularioFranja = false;
        this.franjaSeleccionada = null;

        this.cargarDatos();

        this.modalService.success(
          this.editandoFranja
            ? 'La franja horaria se actualizó correctamente.'
            : 'La franja horaria se agregó correctamente.'
        );
      },

      error: err => {
        console.error(
          'Error guardando franja:',
          err
        );

        this.guardandoFranja = false;

        this.errorFormularioFranja =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo guardar la franja horaria.';
      }
    });
  }

  async eliminarFranja(): Promise<void> {
    if (!this.franjaSeleccionada) {
      return;
    }

    const franja =
      this.franjaSeleccionada;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas eliminar la franja ${franja.horaInicio} - ${franja.horaFin}?`,
        'Eliminar franja horaria'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarFranja(
        franja.idTimeSlot
      )
      .subscribe({
        next: () => {

          this.franjas =
            this.franjas.filter(
              item =>
                item.idTimeSlot !==
                franja.idTimeSlot
            );

          this.franjasDisponibles =
            this.franjasDisponibles.filter(
              item =>
                item.idTimeSlot !==
                franja.idTimeSlot
            );

          this.franjaSeleccionada = null;
        },

        error: err => {
          console.error(
            'Error eliminando franja:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar la franja horaria.'
            )
          );
        }
      });
  }

  seleccionarDisponibilidad(
    item: DisponibilidadFila
  ): void {
    this.disponibilidadSeleccionada =
      item;
  }

  abrirAgregarDisponibilidad(): void {
    this.editandoDisponibilidad = false;
    this.errorFormularioDisponibilidad = '';

    this.formularioDisponibilidad = {
      idAvailability: 0,

      idTeacher:
        this.academicTeachersCatalogo[0]
          ?.idAcademicTeacher ?? 0,

      idTimeSlot:
        this.franjasDisponibles[0]
          ?.idTimeSlot ?? 0,

      diaSemana: 1,
      disponible: true
    };

    this.mostrarFormularioDisponibilidad = true;
  }

  abrirEditarDisponibilidad(): void {
    if (
      !this.disponibilidadSeleccionada
    ) {
      return;
    }

    this.editandoDisponibilidad = true;
    this.errorFormularioDisponibilidad = '';

    const item =
      this.disponibilidadSeleccionada;

    this.formularioDisponibilidad = {
      idAvailability:
        item.idAvailability,

      idTeacher:
        item.idTeacher,

      idTimeSlot:
        item.idTimeSlot,

      diaSemana:
        item.diaSemana,

      disponible:
        item.disponible
    };

    this.mostrarFormularioDisponibilidad = true;
  }

  cerrarFormularioDisponibilidad(): void {
    if (!this.guardandoDisponibilidad) {
      this.mostrarFormularioDisponibilidad =
        false;
    }
  }

  guardarDisponibilidad(): void {
    this.errorFormularioDisponibilidad = '';

    const formulario =
      this.formularioDisponibilidad;

    if (!formulario.idTeacher) {
      this.errorFormularioDisponibilidad =
        'Selecciona un docente.';
      return;
    }

    if (!formulario.idTimeSlot) {
      this.errorFormularioDisponibilidad =
        'Selecciona una franja horaria.';
      return;
    }

    if (!formulario.diaSemana) {
      this.errorFormularioDisponibilidad =
        'Selecciona el día de la semana.';
      return;
    }

    this.guardandoDisponibilidad = true;

    const dto: TeacherAvailabilityRequestDTO = {
      idTeacher:
        Number(formulario.idTeacher),

      idTimeSlot:
        Number(formulario.idTimeSlot),

      dayOfWeek:
        Number(formulario.diaSemana),

      available:
        formulario.disponible
    };

    const peticion =
      this.editandoDisponibilidad
        ? this.horariosService.actualizarDisponibilidad(
            formulario.idAvailability,
            dto
          )
        : this.horariosService.crearDisponibilidad(
            dto
          );

    peticion.subscribe({
      next: () => {

        this.guardandoDisponibilidad = false;
        this.mostrarFormularioDisponibilidad =
          false;

        this.disponibilidadSeleccionada = null;

        this.cargarDatos();

        this.modalService.success(
          this.editandoDisponibilidad
            ? 'La disponibilidad del docente se actualizó correctamente.'
            : 'La disponibilidad del docente se agregó correctamente.'
        );
      },

      error: err => {
        console.error(
          'Error guardando disponibilidad:',
          err
        );

        this.guardandoDisponibilidad = false;

        this.errorFormularioDisponibilidad =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo guardar la disponibilidad del docente.';
      }
    });
  }

  async eliminarDisponibilidad(): Promise<void> {
    if (
      !this.disponibilidadSeleccionada
    ) {
      return;
    }

    const item =
      this.disponibilidadSeleccionada;

    const confirmar =
      await this.modalService.confirm(
        `¿Deseas eliminar la disponibilidad de ${item.docente} el ${item.diaNombre}?`,
        'Eliminar disponibilidad'
      );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarDisponibilidad(
        item.idAvailability
      )
      .subscribe({
        next: () => {

          this.disponibilidades =
            this.disponibilidades.filter(
              registro =>
                registro.idAvailability !==
                item.idAvailability
            );

          this.disponibilidadSeleccionada =
            null;
        },

        error: err => {
          console.error(
            'Error eliminando disponibilidad:',
            err
          );

          this.modalService.error(
            this.mensajeErrorEliminacion(
              err,
              'No se pudo eliminar la disponibilidad.'
            )
          );
        }
      });
  }
}