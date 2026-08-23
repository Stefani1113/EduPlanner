import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { DocentesService, TeachingResponseDTO } from '../../services/docentes.service';
import {
  HorariosService,
  SubjectResponseDTO,
  AcademicTeacherResponseDTO,
  AcademicLoadResponseDTO,
  CourseResponseDTO
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

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss'
})
export class HorariosComponent implements OnInit {

  mostrarDatos = false;
  mostrarFormularioDocente = false;
  editandoDocente = false;
  mostrarFormularioAsignatura = false;
  editandoAsignatura = false;

  cargandoDatos = false;
  errorCarga = '';

  guardandoDocente = false;
  errorFormularioDocente = '';

  guardandoAsignatura = false;
  errorFormularioAsignatura = '';

  docentes: DocenteFila[] = [];
  asignaturas: AsignaturaFila[] = [];
  docenteSeleccionado: DocenteFila | null = null;
  asignaturaSeleccionada: AsignaturaFila | null = null;

  docentesDisponibles: TeachingResponseDTO[] = [];
  cursosDisponibles: CourseResponseDTO[] = [];
  asignaturasCatalogo: SubjectResponseDTO[] = [];

  private academicTeachersPorUsuario = new Map<number, AcademicTeacherResponseDTO>();

  imagenBoton: string = '';

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

  constructor(
    private horariosService: HorariosService,
    private docentesService: DocentesService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarImagenBoton();
  }


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
      next: ({ docentes, cursos, asignaturas, academicTeachers, cargas }) => {

        this.docentesDisponibles = docentes.data ?? [];
        this.cursosDisponibles = cursos.data ?? [];
        this.asignaturasCatalogo = asignaturas.data ?? [];

        const docentesPorId = new Map<number, TeachingResponseDTO>(
          this.docentesDisponibles.map(d => [d.idUser, d])
        );

        const cursosPorId = new Map<number, CourseResponseDTO>(
          this.cursosDisponibles.map(c => [c.idCourse, c])
        );

        const asignaturasPorId = new Map<number, SubjectResponseDTO>(
          this.asignaturasCatalogo.map(a => [a.idSubject, a])
        );

        this.academicTeachersPorUsuario = new Map(
          (academicTeachers.data ?? []).map(at => [at.idUser, at])
        );

        const academicTeacherPorId = new Map<number, AcademicTeacherResponseDTO>(
          (academicTeachers.data ?? []).map(at => [at.idAcademicTeacher, at])
        );

        this.asignaturas = this.asignaturasCatalogo.map(a => ({
          idSubject: a.idSubject,
          nombre: a.name,
          descripcion: a.description ?? '',
          color: a.color ?? '#347d1c'
        }));

        this.docentes = (cargas.data ?? [])
          .map(load => {
            const at = academicTeacherPorId.get(load.idTeacher);
            if (!at) return null;

            const docente = docentesPorId.get(at.idUser);
            if (!docente) return null;

            const curso = cursosPorId.get(load.idCourse);
            const asignatura = asignaturasPorId.get(load.idSubject);

            const fila: DocenteFila = {
              idAcademicLoad: load.idAcademicLoad,
              idAcademicTeacher: at.idAcademicTeacher,
              idUser: at.idUser,
              idCourse: load.idCourse,
              idSubject: load.idSubject,
              nombre: docente.name,
              apellidos: docente.surnames,
              area: asignatura ? asignatura.name : 'Asignatura no encontrada',
              curso: curso ? curso.name : `Curso #${load.idCourse}`,
              maxDailyHours: at.maxDailyHours,
              maxWeeklyHours: at.maxWeeklyHours,
              horasSemanaArea: load.weeklyHours
            };

            return fila;
          })
          .filter((f): f is DocenteFila => f !== null);

        this.cargandoDatos = false;
      },
      error: (err) => {
        this.cargandoDatos = false;
        this.errorCarga = err?.error?.message
          || 'No se pudo cargar la información desde el servidor. Verifica tu conexión.';
      }
    });
  }


  cargarImagenBoton(): void {
    const imagen = localStorage.getItem('imagenBoton');
    if (imagen) {
      this.imagenBoton = imagen;
    }
  }

  guardarImagenBoton(url: string): void {
    this.imagenBoton = url;
    localStorage.setItem('imagenBoton', url);
  }


  abrirDatos(): void {
    this.mostrarDatos = true;
    this.cargarDatos();
  }

  cerrarDatos(): void {
    this.mostrarDatos = false;
  }


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
    if (!this.docenteSeleccionado) return;
    this.editandoDocente = true;
    this.errorFormularioDocente = '';

    const d = this.docenteSeleccionado;
    this.formularioDocente = {
      idAcademicLoad: d.idAcademicLoad,
      idUser: d.idUser,
      idCourse: d.idCourse,
      idSubject: d.idSubject,
      maxDailyHours: d.maxDailyHours,
      maxWeeklyHours: d.maxWeeklyHours,
      horasSemanaArea: d.horasSemanaArea
    };
    this.mostrarFormularioDocente = true;
  }

  cerrarFormularioDocente(): void {
    if (this.guardandoDocente) return;
    this.mostrarFormularioDocente = false;
  }

  nombreDocenteSeleccionadoEnFormulario(): string {
    const d = this.docentesDisponibles.find(x => x.idUser === this.formularioDocente.idUser);
    return d ? `${d.name} ${d.surnames}` : '';
  }

  guardarDocente(): void {
    this.errorFormularioDocente = '';

    const f = this.formularioDocente;

    if (!f.idUser || !f.idCourse || !f.idSubject || !f.horasSemanaArea
      || !f.maxDailyHours || !f.maxWeeklyHours) {
      this.errorFormularioDocente = 'Completa todos los campos obligatorios.';
      return;
    }

    this.guardandoDocente = true;

    const academicTeacherExistente = this.academicTeachersPorUsuario.get(f.idUser);

    const guardarDisponibilidad$ = academicTeacherExistente
      ? this.horariosService.actualizarDocenteAcademico(academicTeacherExistente.idAcademicTeacher, {
          idUser: f.idUser,
          maxDailyHours: f.maxDailyHours,
          maxWeeklyHours: f.maxWeeklyHours
        })
      : this.horariosService.crearDocenteAcademico({
          idUser: f.idUser,
          maxDailyHours: f.maxDailyHours,
          maxWeeklyHours: f.maxWeeklyHours
        });

    guardarDisponibilidad$.subscribe({
      next: (respDisponibilidad) => {
        const idAcademicTeacher = respDisponibilidad.data.idAcademicTeacher;

        const cargaDTO = {
          idTeacher: idAcademicTeacher,
          idCourse: f.idCourse,
          idSubject: f.idSubject,
          weeklyHours: f.horasSemanaArea
        };

        const guardarCarga$ = this.editandoDocente
          ? this.horariosService.actualizarCargaAcademica(f.idAcademicLoad, cargaDTO)
          : this.horariosService.crearCargaAcademica(cargaDTO);

        guardarCarga$.subscribe({
          next: () => {
            this.guardandoDocente = false;
            this.mostrarFormularioDocente = false;
            this.docenteSeleccionado = null;
            this.cargarDatos();
          },
          error: (err) => {
            this.guardandoDocente = false;
            this.errorFormularioDocente = err?.error?.message
              || 'No se pudo guardar la asignación de área para el docente.';
          }
        });
      },
      error: (err) => {
        this.guardandoDocente = false;
        this.errorFormularioDocente = err?.error?.message
          || 'No se pudo guardar la disponibilidad del docente.';
      }
    });
  }

  eliminarDocente(): void {
    if (!this.docenteSeleccionado) return;

    const d = this.docenteSeleccionado;
    const confirmar = confirm(
      `¿Deseas quitar la asignación de "${d.area}" a ${d.nombre} ${d.apellidos}?`
    );
    if (!confirmar) return;

    this.horariosService.eliminarCargaAcademica(d.idAcademicLoad).subscribe({
      next: () => {
        this.docentes = this.docentes.filter(x => x.idAcademicLoad !== d.idAcademicLoad);
        this.docenteSeleccionado = null;
      },
      error: (err) => {
        alert(err?.error?.message || 'No se pudo eliminar la asignación.');
      }
    });
  }

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
    if (!this.asignaturaSeleccionada) return;
    this.editandoAsignatura = true;
    this.errorFormularioAsignatura = '';
    this.formularioAsignatura = { ...this.asignaturaSeleccionada };
    this.mostrarFormularioAsignatura = true;
  }

  cerrarFormularioAsignatura(): void {
    if (this.guardandoAsignatura) return;
    this.mostrarFormularioAsignatura = false;
  }

  guardarAsignatura(): void {
    this.errorFormularioAsignatura = '';

    if (!this.formularioAsignatura.nombre.trim()) {
      this.errorFormularioAsignatura = 'El nombre de la asignatura es obligatorio.';
      return;
    }

    this.guardandoAsignatura = true;

    const dto = {
      name: this.formularioAsignatura.nombre.trim(),
      description: this.formularioAsignatura.descripcion?.trim() || undefined,
      color: this.formularioAsignatura.color || undefined
    };

    const peticion = this.editandoAsignatura
      ? this.horariosService.actualizarAsignatura(this.formularioAsignatura.idSubject, dto)
      : this.horariosService.crearAsignatura(dto);

    peticion.subscribe({
      next: () => {
        this.guardandoAsignatura = false;
        this.mostrarFormularioAsignatura = false;
        this.asignaturaSeleccionada = null;
        this.cargarDatos();
      },
      error: (err) => {
        this.guardandoAsignatura = false;
        this.errorFormularioAsignatura = err?.error?.message
          || (this.editandoAsignatura
            ? 'No se pudo actualizar la asignatura.'
            : 'No se pudo registrar la asignatura.');
      }
    });
  }

  eliminarAsignatura(): void {
    if (!this.asignaturaSeleccionada) return;
    const confirmar = confirm(`¿Deseas eliminar ${this.asignaturaSeleccionada.nombre}?`);
    if (!confirmar) return;

    const a = this.asignaturaSeleccionada;

    this.horariosService.eliminarAsignatura(a.idSubject).subscribe({
      next: () => {
        this.asignaturas = this.asignaturas.filter(x => x.idSubject !== a.idSubject);
        this.asignaturaSeleccionada = null;
      },
      error: (err) => {
        alert(err?.error?.message || 'No se pudo eliminar la asignatura.');
      }
    });
  }
}
