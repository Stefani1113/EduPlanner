import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  DocentesService,
  TeachingResponseDTO
} from '../../services/docentes.service';

import {
  HorariosService,
  SubjectResponseDTO,
  AcademicTeacherResponseDTO,
  CourseResponseDTO,
  CourseRequestDTO,
  AcademicPeriodResponseDTO,
  AcademicLevelResponseDTO,
  SchoolShiftResponseDTO
} from '../../services/horarios.service';

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


@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss'
})
export class HorariosComponent implements OnInit {

  // ==============================
  // ESTADOS DE VISTAS
  // ==============================

  mostrarDatos = false;

  mostrarFormularioDocente = false;
  mostrarFormularioAsignatura = false;
  mostrarFormularioCurso = false;

  editandoDocente = false;
  editandoAsignatura = false;
  editandoCurso = false;

  cargandoDatos = false;

  guardandoDocente = false;
  guardandoAsignatura = false;
  guardandoCurso = false;


  // ==============================
  // MENSAJES DE ERROR
  // ==============================

  errorCarga = '';

  errorFormularioDocente = '';
  errorFormularioAsignatura = '';
  errorFormularioCurso = '';


  // ==============================
  // IMAGEN
  // ==============================

  imagenBoton = '';


  // ==============================
  // LISTAS PARA LA VISTA
  // ==============================

  docentes: DocenteFila[] = [];
  asignaturas: AsignaturaFila[] = [];
  cursos: CursoFila[] = [];


  // ==============================
  // ELEMENTOS SELECCIONADOS
  // ==============================

  docenteSeleccionado: DocenteFila | null = null;
  asignaturaSeleccionada: AsignaturaFila | null = null;
  cursoSeleccionado: CursoFila | null = null;


  // ==============================
  // DATOS DEL BACKEND
  // ==============================

  docentesDisponibles: TeachingResponseDTO[] = [];
  cursosDisponibles: CourseResponseDTO[] = [];
  asignaturasCatalogo: SubjectResponseDTO[] = [];

  periodosDisponibles: AcademicPeriodResponseDTO[] = [];
  nivelesDisponibles: AcademicLevelResponseDTO[] = [];
  jornadasDisponibles: SchoolShiftResponseDTO[] = [];


  // ==============================
  // MAPA DE DOCENTES ACADÉMICOS
  // Key: idUser
  // ==============================

  private academicTeachersPorUsuario =
    new Map<number, AcademicTeacherResponseDTO>();


  // ==============================
  // FORMULARIO DOCENTE
  // ==============================

  formularioDocente = {
    idAcademicLoad: 0,
    idUser: 0,
    idCourse: 0,
    idSubject: 0,
    maxDailyHours: 6,
    maxWeeklyHours: 30,
    horasSemanaArea: 0
  };


  // ==============================
  // FORMULARIO ASIGNATURA
  // ==============================

  formularioAsignatura = {
    idSubject: 0,
    nombre: '',
    descripcion: '',
    color: '#347d1c'
  };


  // ==============================
  // FORMULARIO CURSO
  // ==============================

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


  constructor(
    private horariosService: HorariosService,
    private docentesService: DocentesService,
    private modalService: ModalService
  ) {}


  ngOnInit(): void {
    this.cargarDatos();
    this.cargarImagenBoton();
  }


  // =====================================================
  // CARGAR TODOS LOS DATOS
  // =====================================================

  cargarDatos(): void {

    this.cargandoDatos = true;
    this.errorCarga = '';

    forkJoin({
      docentes: this.docentesService.listar(),
      cursos: this.horariosService.listarCursos(),
      asignaturas: this.horariosService.listarAsignaturas(),
      academicTeachers: this.horariosService.listarDocentesAcademicos(),
      cargas: this.horariosService.listarCargasAcademicas(),
      periodos: this.horariosService.listarPeriodos(),
      niveles: this.horariosService.listarNiveles(),
      jornadas: this.horariosService.listarJornadas()
    }).subscribe({

      next: ({
        docentes,
        cursos,
        asignaturas,
        academicTeachers,
        cargas,
        periodos,
        niveles,
        jornadas
      }) => {

        // ==============================
        // GUARDAR RESPUESTAS
        // ==============================

        this.docentesDisponibles = docentes.data ?? [];
        this.cursosDisponibles = cursos.data ?? [];
        this.asignaturasCatalogo = asignaturas.data ?? [];

        this.periodosDisponibles = periodos.data ?? [];
        this.nivelesDisponibles = niveles.data ?? [];
        this.jornadasDisponibles = jornadas.data ?? [];


        // ==============================
        // MAPA DE DOCENTES
        // ==============================

        const docentesPorId =
          new Map<number, TeachingResponseDTO>(
            this.docentesDisponibles.map(docente => [
              docente.idUser,
              docente
            ])
          );


        // ==============================
        // MAPA DE CURSOS
        // ==============================

        const cursosPorId =
          new Map<number, CourseResponseDTO>(
            this.cursosDisponibles.map(curso => [
              curso.idCourse,
              curso
            ])
          );


        // ==============================
        // MAPA DE ASIGNATURAS
        // ==============================

        const asignaturasPorId =
          new Map<number, SubjectResponseDTO>(
            this.asignaturasCatalogo.map(asignatura => [
              asignatura.idSubject,
              asignatura
            ])
          );


        // ==============================
        // DOCENTES ACADÉMICOS
        // ==============================

        const academicTeachersData =
          academicTeachers.data ?? [];

        this.academicTeachersPorUsuario =
          new Map<number, AcademicTeacherResponseDTO>(
            academicTeachersData.map(docente => [
              docente.idUser,
              docente
            ])
          );


        const academicTeacherPorId =
          new Map<number, AcademicTeacherResponseDTO>(
            academicTeachersData.map(docente => [
              docente.idAcademicTeacher,
              docente
            ])
          );


        // ==============================
        // MAPEAR ASIGNATURAS
        // ==============================

        this.asignaturas =
          this.asignaturasCatalogo.map(asignatura => ({
            idSubject: asignatura.idSubject,
            nombre: asignatura.name ?? '',
            descripcion: asignatura.description ?? '',
            color: asignatura.color ?? '#347d1c'
          }));


        // ==============================
        // MAPEAR CURSOS
        // ==============================

        this.cursos =
          this.cursosDisponibles.map(curso => {

            /*
             * homeroomTeacher puede ser el ID del
             * docente académico, por eso primero
             * buscamos el docente académico.
             */
            const academicTeacher =
              curso.homeroomTeacher !== null &&
              curso.homeroomTeacher !== undefined
                ? academicTeacherPorId.get(curso.homeroomTeacher)
                : undefined;

            const docenteTitular =
              academicTeacher
                ? docentesPorId.get(academicTeacher.idUser)
                : undefined;

            return {
              idCourse: curso.idCourse,
              idPeriod: Number(curso.idPeriod ?? 0),
              idLevel: Number(curso.idLevel ?? 0),
              idShift: Number(curso.idShift ?? 0),

              homeroomTeacher:
                curso.homeroomTeacher ?? null,

              nombre: curso.name ?? '',

              docenteTitular: docenteTitular
                ? `${docenteTitular.name ?? ''} ${docenteTitular.surnames ?? ''}`.trim()
                : 'Sin asignar',

              nivel: this.obtenerNombreNivel(
                Number(curso.idLevel ?? 0)
              ),

              jornada: this.obtenerNombreJornada(
                Number(curso.idShift ?? 0)
              ),

              estudiantes: Number(
                curso.studentCount ?? 0
              )
            };
          });


        // ==============================
        // MAPEAR CARGAS ACADÉMICAS
        // ==============================

        this.docentes =
          (cargas.data ?? [])
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
                cursosPorId.get(carga.idCourse);

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

                area: asignatura
                  ? (asignatura.name ?? 'Asignatura sin nombre')
                  : 'Asignatura no encontrada',

                curso: curso
                  ? (curso.name ?? 'Curso sin nombre')
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
              (fila): fila is DocenteFila =>
                fila !== null
            );


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


  // =====================================================
  // OBTENER NOMBRES
  // =====================================================

  obtenerNombreNivel(idLevel: number): string {

    return (
      this.nivelesDisponibles.find(
        nivel => nivel.idLevel === idLevel
      )?.name ?? `Nivel ${idLevel}`
    );
  }


  obtenerNombreJornada(idShift: number): string {

    return (
      this.jornadasDisponibles.find(
        jornada => jornada.idShift === idShift
      )?.name ?? `Jornada ${idShift}`
    );
  }


  // =====================================================
  // IMAGEN DEL BOTÓN
  // =====================================================

  cargarImagenBoton(): void {

    const imagen =
      localStorage.getItem('imagenBoton');

    if (imagen) {
      this.imagenBoton = imagen;
    }
  }


  // =====================================================
  // PANEL DE DATOS
  // =====================================================

  abrirDatos(): void {
    this.mostrarDatos = true;
    this.cargarDatos();
  }


  cerrarDatos(): void {
    this.mostrarDatos = false;
  }


  // =====================================================
  // DOCENTES
  // =====================================================

  seleccionarDocente(docente: DocenteFila): void {
    this.docenteSeleccionado = docente;
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
      idAcademicLoad: docente.idAcademicLoad,
      idUser: docente.idUser,
      idCourse: docente.idCourse,
      idSubject: docente.idSubject,
      maxDailyHours: docente.maxDailyHours,
      maxWeeklyHours: docente.maxWeeklyHours,
      horasSemanaArea: docente.horasSemanaArea
    };

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
      !formulario.horasSemanaArea ||
      !formulario.maxDailyHours ||
      !formulario.maxWeeklyHours
    ) {
      this.errorFormularioDocente =
        'Completa todos los campos obligatorios.';
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


    if (formulario.horasSemanaArea <= 0) {
      this.errorFormularioDocente =
        'Las horas semanales de la asignatura deben ser mayores que 0.';
      return;
    }


    this.guardandoDocente = true;


    const academicTeacherExistente =
      this.academicTeachersPorUsuario.get(
        formulario.idUser
      );


    const guardarDisponibilidad$ =
      academicTeacherExistente

        ? this.horariosService.actualizarDocenteAcademico(
            academicTeacherExistente.idAcademicTeacher,
            {
              idUser: formulario.idUser,
              maxDailyHours: formulario.maxDailyHours,
              maxWeeklyHours: formulario.maxWeeklyHours
            }
          )

        : this.horariosService.crearDocenteAcademico({
            idUser: formulario.idUser,
            maxDailyHours: formulario.maxDailyHours,
            maxWeeklyHours: formulario.maxWeeklyHours
          });


    guardarDisponibilidad$.subscribe({

      next: respuesta => {

        /*
         * Cuando se actualiza, algunos backends no devuelven
         * el objeto completo. Por eso usamos el ID existente
         * como respaldo.
         */
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
          idTeacher: idAcademicTeacher,
          idCourse: formulario.idCourse,
          idSubject: formulario.idSubject,
          weeklyHours: formulario.horasSemanaArea
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
          'No se pudo guardar la disponibilidad del docente.';
      }

    });
  }


  async eliminarDocente(): Promise<void> {

    if (!this.docenteSeleccionado) {
      return;
    }

    const docente =
      this.docenteSeleccionado;

    const confirmar = await this.modalService.confirm(
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
            err?.error?.message ||
            err?.error?.error ||
            'No se pudo eliminar la asignación.'
          );
        }

      });
  }


  // =====================================================
  // ASIGNATURAS
  // =====================================================

  seleccionarAsignatura(asignatura: AsignaturaFila): void {
    this.asignaturaSeleccionada = asignatura;
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
      color: color
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

    const confirmar = await this.modalService.confirm(
      `¿Deseas eliminar ${asignatura.nombre}?`,
      'Eliminar asignatura'
    );

    if (!confirmar) {
      return;
    }


    this.horariosService
      .eliminarAsignatura(
        asignatura.idSubject
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
        },


        error: err => {

          console.error(
            'Error eliminando asignatura:',
            err
          );

          this.modalService.error(
            err?.error?.message ||
            err?.error?.error ||
            'No se pudo eliminar la asignatura.'
          );
        }

      });
  }


  // =====================================================
  // CURSOS
  // =====================================================

  seleccionarCurso(curso: CursoFila): void {
    this.cursoSeleccionado = curso;
  }


  abrirAgregarCurso(): void {

    this.editandoCurso = false;
    this.errorFormularioCurso = '';


    /*
     * El ?? null es importante porque el primer elemento
     * puede no existir y TypeScript devuelve undefined.
     */
    const primerPeriodoDisponible =
      this.periodosDisponibles[0]?.idPeriod ?? null;

    const primerNivelDisponible =
      this.nivelesDisponibles[0]?.idLevel ?? 0;

    const primeraJornadaDisponible =
      this.jornadasDisponibles[0]?.idShift ?? 0;


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
      idCourse: curso.idCourse,
      idPeriod: curso.idPeriod ?? null,
      idLevel: curso.idLevel,
      idShift: curso.idShift,
      homeroomTeacher: curso.homeroomTeacher,
      nombre: curso.nombre ?? '',
      estudiantes: curso.estudiantes
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
        periodo => periodo.idPeriod === idPeriod
      )
    ) {

      this.errorFormularioCurso =
        'El período seleccionado no existe. Selecciona un período válido.';

      return;
    }


    if (
      !this.nivelesDisponibles.some(
        nivel => nivel.idLevel === idLevel
      )
    ) {

      this.errorFormularioCurso =
        'Selecciona un nivel válido.';

      return;
    }


    if (
      !this.jornadasDisponibles.some(
        jornada => jornada.idShift === idShift
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


    /*
     * El select guarda el idUser del docente.
     * El backend necesita el idAcademicTeacher.
     */
    const idUserHomeroomTeacher =
      formulario.homeroomTeacher !== null &&
      Number(formulario.homeroomTeacher) > 0

        ? Number(formulario.homeroomTeacher)

        : null;


    let homeroomTeacher: number | null = null;


    if (idUserHomeroomTeacher !== null) {

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
      },


      error: err => {

        this.guardandoCurso = false;

        console.error(
          'ERROR AL GUARDAR CURSO',
          err
        );


        let mensaje = '';


        if (typeof err?.error === 'string') {

          mensaje = err.error;

        } else if (err?.error?.message) {

          mensaje = err.error.message;

        } else if (err?.error?.error) {

          mensaje = err.error.error;

        } else if (err?.message) {

          mensaje = err.message;
        }


        const mensajeLower =
          mensaje.toLowerCase();


        if (
          mensajeLower.includes('fk_course_period') ||
          mensajeLower.includes('academic_period') ||
          mensajeLower.includes('foreign key')
        ) {

          this.errorFormularioCurso =
            'El período seleccionado no existe. Selecciona un período válido.';

        } else if (err?.status === 500) {

          this.errorFormularioCurso =
            mensaje ||
            'El servidor no pudo registrar el curso.';

        } else if (err?.status === 400) {

          this.errorFormularioCurso =
            mensaje ||
            'Los datos del curso no son válidos.';

        } else if (err?.status === 401) {

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

    const confirmar = await this.modalService.confirm(
      `¿Deseas eliminar el curso ${curso.nombre}?`,
      'Eliminar curso'
    );

    if (!confirmar) {
      return;
    }


    this.horariosService
      .eliminarCurso(
        curso.idCourse
      )
      .subscribe({

        next: () => {

          this.cursos =
            this.cursos.filter(
              item =>
                item.idCourse !== curso.idCourse
            );

          this.cursosDisponibles =
            this.cursosDisponibles.filter(
              item =>
                item.idCourse !== curso.idCourse
            );

          this.cursoSeleccionado = null;
        },


        error: err => {

          console.error(
            'Error eliminando curso:',
            err
          );

          this.modalService.error(
            err?.error?.message ||
            err?.error?.error ||
            'No se pudo eliminar el curso.'
          );
        } 

      });
  }

}