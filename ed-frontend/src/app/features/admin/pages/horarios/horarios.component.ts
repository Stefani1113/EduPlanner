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
  CourseRequestDTO
} from '../../services/horarios.service';


interface DocenteFila {
  idAcademicLoad: number;
  idAcademicTeacher: number;
  idUser: number;
  idCourse: number;
  idSubject: number;
  nombre: string;
  apellidos: string;
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

  // ================= ESTADO GENERAL =================

  mostrarDatos = false;

  mostrarFormularioDocente = false;
  mostrarFormularioAsignatura = false;
  mostrarFormularioCurso = false;

  editandoDocente = false;
  editandoAsignatura = false;
  editandoCurso = false;

  cargandoDatos = false;
  errorCarga = '';

  guardandoDocente = false;
  guardandoAsignatura = false;
  guardandoCurso = false;

  errorFormularioDocente = '';
  errorFormularioAsignatura = '';
  errorFormularioCurso = '';

  imagenBoton = '';


  // ================= DATOS =================

  docentes: DocenteFila[] = [];
  asignaturas: AsignaturaFila[] = [];
  cursos: CursoFila[] = [];

  docenteSeleccionado: DocenteFila | null = null;
  asignaturaSeleccionada: AsignaturaFila | null = null;
  cursoSeleccionado: CursoFila | null = null;

  docentesDisponibles: TeachingResponseDTO[] = [];
  cursosDisponibles: CourseResponseDTO[] = [];
  asignaturasCatalogo: SubjectResponseDTO[] = [];

  private academicTeachersPorUsuario =
    new Map<number, AcademicTeacherResponseDTO>();


  // ================= FORMULARIO DOCENTE =================

  formularioDocente = {
    idAcademicLoad: 0,
    idUser: 0,
    idCourse: 0,
    idSubject: 0,
    maxDailyHours: 6,
    maxWeeklyHours: 30,
    horasSemanaArea: 0
  };


  // ================= FORMULARIO ASIGNATURA =================

  formularioAsignatura = {
    idSubject: 0,
    nombre: '',
    descripcion: '',
    color: '#347d1c'
  };


  // ================= FORMULARIO CURSO =================

  formularioCurso = {
    idCourse: 0,
    idPeriod: 1,
    idLevel: 1,
    idShift: 1,
    homeroomTeacher: 0,
    nombre: '',
    estudiantes: 0
  };


  constructor(
    private horariosService: HorariosService,
    private docentesService: DocentesService
  ) {}


  ngOnInit(): void {
    this.cargarDatos();
    this.cargarImagenBoton();
  }


  // =========================================================
  // CARGAR DATOS
  // =========================================================

  cargarDatos(): void {

    this.cargandoDatos = true;
    this.errorCarga = '';

    forkJoin({
      docentes: this.docentesService.listar(),
      cursos: this.horariosService.listarCursos(),
      asignaturas: this.horariosService.listarAsignaturas(),
      academicTeachers: this.horariosService.listarDocentesAcademicos(),
      cargas: this.horariosService.listarCargasAcademicas()
    }).subscribe({

      next: ({
        docentes,
        cursos,
        asignaturas,
        academicTeachers,
        cargas
      }) => {

        this.docentesDisponibles = docentes.data ?? [];
        this.cursosDisponibles = cursos.data ?? [];
        this.asignaturasCatalogo = asignaturas.data ?? [];


        const docentesPorId =
          new Map<number, TeachingResponseDTO>(
            this.docentesDisponibles.map(docente => [
              docente.idUser,
              docente
            ])
          );


        const cursosPorId =
          new Map<number, CourseResponseDTO>(
            this.cursosDisponibles.map(curso => [
              curso.idCourse,
              curso
            ])
          );


        const asignaturasPorId =
          new Map<number, SubjectResponseDTO>(
            this.asignaturasCatalogo.map(asignatura => [
              asignatura.idSubject,
              asignatura
            ])
          );


        this.academicTeachersPorUsuario =
          new Map<number, AcademicTeacherResponseDTO>(
            (academicTeachers.data ?? []).map(docente => [
              docente.idUser,
              docente
            ])
          );


        const academicTeacherPorId =
          new Map<number, AcademicTeacherResponseDTO>(
            (academicTeachers.data ?? []).map(docente => [
              docente.idAcademicTeacher,
              docente
            ])
          );


        // ================= ASIGNATURAS =================

        this.asignaturas = this.asignaturasCatalogo.map(asignatura => ({
          idSubject: asignatura.idSubject,
          nombre: asignatura.name,
          descripcion: asignatura.description ?? '',
          color: asignatura.color ?? '#347d1c'
        }));


        // ================= CURSOS =================

        this.cursos = this.cursosDisponibles.map(curso => {

          const docenteTitular = curso.homeroomTeacher
            ? docentesPorId.get(curso.homeroomTeacher)
            : null;

          return {
            idCourse: curso.idCourse,
            idPeriod: curso.idPeriod,
            idLevel: curso.idLevel,
            idShift: curso.idShift,
            homeroomTeacher: curso.homeroomTeacher,
            nombre: curso.name,

            docenteTitular: docenteTitular
              ? `${docenteTitular.name} ${docenteTitular.surnames}`
              : 'Sin asignar',

            nivel: this.obtenerNombreNivel(curso.idLevel),
            jornada: this.obtenerNombreJornada(curso.idShift),
            estudiantes: curso.studentCount
          };
        });


        // ================= CARGAS DOCENTES =================

        this.docentes = (cargas.data ?? [])
          .map(carga => {

            const academicTeacher =
              academicTeacherPorId.get(carga.idTeacher);

            if (!academicTeacher) {
              return null;
            }

            const docente =
              docentesPorId.get(academicTeacher.idUser);

            if (!docente) {
              return null;
            }

            const curso = cursosPorId.get(carga.idCourse);

            const asignatura =
              asignaturasPorId.get(carga.idSubject);

            return {
              idAcademicLoad: carga.idAcademicLoad,
              idAcademicTeacher: academicTeacher.idAcademicTeacher,
              idUser: academicTeacher.idUser,
              idCourse: carga.idCourse,
              idSubject: carga.idSubject,

              nombre: docente.name,
              apellidos: docente.surnames,

              area: asignatura
                ? asignatura.name
                : 'Asignatura no encontrada',

              curso: curso
                ? curso.name
                : `Curso #${carga.idCourse}`,

              maxDailyHours: academicTeacher.maxDailyHours,
              maxWeeklyHours: academicTeacher.maxWeeklyHours,
              horasSemanaArea: carga.weeklyHours

            } as DocenteFila;

          })
          .filter(
            (fila): fila is DocenteFila => fila !== null
          );


        this.cargandoDatos = false;
      },


      error: (err) => {

        console.error('Error cargando datos:', err);

        this.cargandoDatos = false;

        this.errorCarga =
          err?.error?.message ||
          'No se pudo cargar la información desde el servidor.';
      }

    });
  }


  // =========================================================
  // UTILIDADES
  // =========================================================

  obtenerNombreNivel(idLevel: number): string {

    const niveles: Record<number, string> = {
      1: 'Primaria',
      2: 'Secundaria',
      3: 'Media'
    };

    return niveles[idLevel] ?? `Nivel ${idLevel}`;
  }


  obtenerNombreJornada(idShift: number): string {

    const jornadas: Record<number, string> = {
      1: 'Diurna',
      2: 'Nocturna'
    };

    return jornadas[idShift] ?? `Jornada ${idShift}`;
  }


  cargarImagenBoton(): void {

    const imagen = localStorage.getItem('imagenBoton');

    if (imagen) {
      this.imagenBoton = imagen;
    }
  }


  abrirDatos(): void {
    this.mostrarDatos = true;
    this.cargarDatos();
  }


  cerrarDatos(): void {
    this.mostrarDatos = false;
  }


  // =========================================================
  // DOCENTES
  // =========================================================

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

    const docente = this.docenteSeleccionado;

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

    const formulario = this.formularioDocente;

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

    this.guardandoDocente = true;

    const academicTeacherExistente =
      this.academicTeachersPorUsuario.get(formulario.idUser);


    const guardarDisponibilidad$ = academicTeacherExistente

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

      next: (respuesta) => {

        const idAcademicTeacher =
          respuesta.data.idAcademicTeacher;

        const carga = {
          idTeacher: idAcademicTeacher,
          idCourse: formulario.idCourse,
          idSubject: formulario.idSubject,
          weeklyHours: formulario.horasSemanaArea
        };


        const guardarCarga$ = this.editandoDocente

          ? this.horariosService.actualizarCargaAcademica(
              formulario.idAcademicLoad,
              carga
            )

          : this.horariosService.crearCargaAcademica(carga);


        guardarCarga$.subscribe({

          next: () => {

            this.guardandoDocente = false;
            this.mostrarFormularioDocente = false;
            this.docenteSeleccionado = null;

            this.cargarDatos();
          },

          error: (err) => {

            console.error('Error guardando carga:', err);

            this.guardandoDocente = false;

            this.errorFormularioDocente =
              err?.error?.message ||
              'No se pudo guardar la información del docente.';
          }

        });
      },


      error: (err) => {

        console.error('Error guardando docente académico:', err);

        this.guardandoDocente = false;

        this.errorFormularioDocente =
          err?.error?.message ||
          'No se pudo guardar la disponibilidad del docente.';
      }

    });
  }


  eliminarDocente(): void {

    if (!this.docenteSeleccionado) {
      return;
    }

    const docente = this.docenteSeleccionado;

    const confirmar = confirm(
      `¿Deseas quitar la asignación de "${docente.area}" a ${docente.nombre} ${docente.apellidos}?`
    );

    if (!confirmar) {
      return;
    }

    this.horariosService
      .eliminarCargaAcademica(docente.idAcademicLoad)
      .subscribe({

        next: () => {

          this.docentes = this.docentes.filter(
            item => item.idAcademicLoad !== docente.idAcademicLoad
          );

          this.docenteSeleccionado = null;
        },

        error: (err) => {

          console.error('Error eliminando carga:', err);

          alert(
            err?.error?.message ||
            'No se pudo eliminar la asignación.'
          );
        }

      });
  }


  // =========================================================
  // ASIGNATURAS
  // =========================================================

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

    if (!this.formularioAsignatura.nombre.trim()) {

      this.errorFormularioAsignatura =
        'El nombre de la asignatura es obligatorio.';

      return;
    }

    this.guardandoAsignatura = true;

    const dto = {
      name: this.formularioAsignatura.nombre.trim(),
      description:
        this.formularioAsignatura.descripcion.trim() || undefined,
      color:
        this.formularioAsignatura.color || undefined
    };


    const peticion = this.editandoAsignatura

      ? this.horariosService.actualizarAsignatura(
          this.formularioAsignatura.idSubject,
          dto
        )

      : this.horariosService.crearAsignatura(dto);


    peticion.subscribe({

      next: () => {

        this.guardandoAsignatura = false;
        this.mostrarFormularioAsignatura = false;
        this.asignaturaSeleccionada = null;

        this.cargarDatos();
      },

      error: (err) => {

        console.error('Error guardando asignatura:', err);

        this.guardandoAsignatura = false;

        this.errorFormularioAsignatura =
          err?.error?.message ||
          'No se pudo guardar la asignatura.';
      }

    });
  }


  eliminarAsignatura(): void {

    if (!this.asignaturaSeleccionada) {
      return;
    }

    const asignatura = this.asignaturaSeleccionada;

    if (!confirm(`¿Deseas eliminar ${asignatura.nombre}?`)) {
      return;
    }

    this.horariosService
      .eliminarAsignatura(asignatura.idSubject)
      .subscribe({

        next: () => {

          this.asignaturas = this.asignaturas.filter(
            item => item.idSubject !== asignatura.idSubject
          );

          this.asignaturaSeleccionada = null;
        },

        error: (err) => {

          console.error('Error eliminando asignatura:', err);

          alert(
            err?.error?.message ||
            'No se pudo eliminar la asignatura.'
          );
        }

      });
  }


  // =========================================================
  // CURSOS
  // =========================================================

  seleccionarCurso(curso: CursoFila): void {
    this.cursoSeleccionado = curso;
  }


  abrirAgregarCurso(): void {

    this.editandoCurso = false;
    this.errorFormularioCurso = '';

    this.formularioCurso = {
      idCourse: 0,
      idPeriod: 1,
      idLevel: 1,
      idShift: 1,
      homeroomTeacher: 0,
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

    const curso = this.cursoSeleccionado;

    this.formularioCurso = {
      idCourse: curso.idCourse,
      idPeriod: curso.idPeriod,
      idLevel: curso.idLevel,
      idShift: curso.idShift,
      homeroomTeacher: curso.homeroomTeacher ?? 0,
      nombre: curso.nombre,
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

  const formulario = this.formularioCurso;

  // Validar nombre
  const nombre = formulario.nombre?.trim();

  if (!nombre) {
    this.errorFormularioCurso = 'El nombre del curso es obligatorio.';
    return;
  }

  // Convertir todos los valores explícitamente a número
  const idPeriod = Number(formulario.idPeriod);
  const idLevel = Number(formulario.idLevel);
  const idShift = Number(formulario.idShift);
  const estudiantes = Number(formulario.estudiantes);

  // Validar periodo
  if (!Number.isInteger(idPeriod) || idPeriod <= 0) {
    this.errorFormularioCurso = 'Selecciona un periodo académico válido.';
    return;
  }

  // Validar nivel
  if (!Number.isInteger(idLevel) || idLevel <= 0) {
    this.errorFormularioCurso = 'Selecciona un nivel válido.';
    return;
  }

  // Validar jornada
  if (!Number.isInteger(idShift) || idShift <= 0) {
    this.errorFormularioCurso = 'Selecciona una jornada válida.';
    return;
  }

  // Validar estudiantes
  if (
    !Number.isInteger(estudiantes) ||
    estudiantes < 0 ||
    estudiantes > 32767
  ) {
    this.errorFormularioCurso =
      'La cantidad de estudiantes debe ser un número entero entre 0 y 32.767.';
    return;
  }

  /*
   * IMPORTANTE:
   * Si no hay docente seleccionado enviamos null.
   * No enviamos 0 porque normalmente un ID 0 no existe en la base de datos.
   */
  const docenteSeleccionado = Number(formulario.homeroomTeacher);

  const dto: CourseRequestDTO = {
    idPeriod,
    idLevel,
    idShift,
    homeroomTeacher:
      Number.isInteger(docenteSeleccionado) && docenteSeleccionado > 0
        ? docenteSeleccionado
        : null,
    name: nombre,
    studentCount: estudiantes
  };

  console.log('Curso enviado al backend:', dto);

  this.guardandoCurso = true;

  const peticion = this.editandoCurso
    ? this.horariosService.actualizarCurso(formulario.idCourse, dto)
    : this.horariosService.crearCurso(dto);

  peticion.subscribe({
    next: () => {
      this.guardandoCurso = false;
      this.mostrarFormularioCurso = false;
      this.cursoSeleccionado = null;

      // Recargar la información desde la base de datos
      this.cargarDatos();
    },

    error: (err) => {
      this.guardandoCurso = false;

      console.error('Error completo al guardar curso:', err);
      console.error('Respuesta del servidor:', err?.error);
      console.error('Datos enviados:', dto);

      if (err.status === 500) {
        this.errorFormularioCurso =
          err?.error?.message ||
          'El servidor presentó un error al registrar el curso.';
      } else if (err.status === 400) {
        this.errorFormularioCurso =
          err?.error?.message ||
          'Los datos enviados no son válidos.';
      } else {
        this.errorFormularioCurso =
          err?.error?.message ||
          'No se pudo guardar el curso.';
      }
    }
  });
}


  eliminarCurso(): void {

    if (!this.cursoSeleccionado) {
      return;
    }

    const curso = this.cursoSeleccionado;

    if (!confirm(`¿Deseas eliminar el curso ${curso.nombre}?`)) {
      return;
    }

    this.horariosService
      .eliminarCurso(curso.idCourse)
      .subscribe({

        next: () => {

          this.cursos = this.cursos.filter(
            item => item.idCourse !== curso.idCourse
          );

          this.cursosDisponibles =
            this.cursosDisponibles.filter(
              item => item.idCourse !== curso.idCourse
            );

          this.cursoSeleccionado = null;
        },

        error: (err) => {

          console.error('Error eliminando curso:', err);

          alert(
            err?.error?.message ||
            'No se pudo eliminar el curso.'
          );
        }

      });
  }

}