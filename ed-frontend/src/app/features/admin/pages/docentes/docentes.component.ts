import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DocentesService,
  TeachingRequestDTO,
  TeachingResponseDTO
} from '../../services/docentes.service';

const ID_INSTITUCION_FIJO = 1;
const API_BASE_URL = 'http://localhost:8080';

function emptyForm(): TeachingRequestDTO {
  return {
    name: '',  
    surnames: '',
    email: '',
    password: '',
    documentType: 'CC',
    document: '',
    documentIssuePlace: '',
    birthdate: '',
    phoneNumber: '',
    photoUrl: '',
    professionalDegrees: '',
    qualificationsDesc: '',
    gender: 'Masculino',
    address: '',
    bloodType: 'O+',
    disabilities: '',
    stratum: 1,
    populationType: '',
    healthRegime: '',
    eps: '',
    position: 'Docente',
    idInstitution: ID_INSTITUCION_FIJO
  };
}

function formDesdeDocente(
  d: TeachingResponseDTO
): TeachingRequestDTO {
  return {
    name: d.name ?? '',
    surnames: d.surnames ?? '',
    email: d.email ?? '',
    password: '',
    documentType: d.documentType ?? 'CC',
    document: d.document ?? '',
    documentIssuePlace: d.documentIssuePlace ?? '',
    birthdate: d.birthdate ?? '',
    phoneNumber: d.phoneNumber ?? '',
    photoUrl: d.photoUrl ?? '',
    professionalDegrees: d.professionalDegrees ?? '',
    qualificationsDesc: d.qualificationsDesc ?? '',
    gender: d.gender ?? 'Masculino',
    address: d.address ?? '',
    bloodType: d.bloodType ?? 'O+',
    disabilities: d.disabilities ?? '',
    stratum: d.stratum ?? 1,
    populationType: d.populationType ?? '',
    healthRegime: d.healthRegime ?? '',
    eps: d.eps ?? '',
    position: d.position ?? 'Docente',
    idInstitution: d.idInstitution ?? ID_INSTITUCION_FIJO
  };
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.scss'
})
export class DocentesComponent implements OnInit {

  docentes: TeachingResponseDTO[] = [];

  cargando = false;
  errorCarga = '';
  busqueda = '';

  mostrarFormulario = false;
  mostrarPerfil = false;
  mostrarConfirmacionEliminar = false;
  mostrarMasCampos = false;

  guardando = false;
  eliminando = false;

  errorFormulario = '';
  errorEliminacion = '';

  docenteEnEdicion: TeachingResponseDTO | null = null;
  docenteSeleccionado: TeachingResponseDTO | null = null;
  docenteParaEliminar: TeachingResponseDTO | null = null;

  form: TeachingRequestDTO = emptyForm();

  constructor(
    private docentesService: DocentesService
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

  cargarDocentes(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.docentesService.listar().subscribe({
      next: (res) => {
        this.docentes = (res.data ?? []).map(
          docente => this.prepararDocente(docente)
        );

        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;

        this.errorCarga =
          err.error?.message ??
          'No se pudo cargar el listado de docentes. Verifica tu conexión con el servidor.';
      }
    });
  }

  private prepararDocente(
    docente: TeachingResponseDTO
  ): TeachingResponseDTO {
    return {
      ...docente,
      photoUrl: this.normalizarFoto(docente.photoUrl)
    };
  }

  private normalizarFoto(
    photoUrl: string | null | undefined
  ): string {
    if (!photoUrl) {
      return '';
    }

    const foto = photoUrl.trim();

    if (!foto) {
      return '';
    }

    if (foto.startsWith('data:image/')) {
      return foto;
    }

    if (
      foto.startsWith('http://') ||
      foto.startsWith('https://')
    ) {
      return foto;
    }

    if (foto.startsWith('blob:')) {
      return foto;
    }

    if (foto.startsWith('/')) {
      return `${API_BASE_URL}${foto}`;
    }

    return `${API_BASE_URL}/${foto}`;
  }

  obtenerFoto(
    docente: TeachingResponseDTO
  ): string {
    if (!docente.photoUrl) {
      return '';
    }

    return this.normalizarFoto(docente.photoUrl);
  }


 
  obtenerDescripcionLineas(desc: string | null | undefined): string[] {
    if (!desc) {
      return [];
    }

    return desc
      .split(/\r?\n|(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ])/)
      .map(linea => linea.trim())
      .filter(linea => linea.length > 0);
  }

  get docentesFiltrados(): TeachingResponseDTO[] {
    const term = this.busqueda
      .trim()
      .toLowerCase();

    if (!term) {
      return this.docentes;
    }

    return this.docentes.filter(d =>
      `${d.name ?? ''} ${d.surnames ?? ''}`
        .toLowerCase()
        .includes(term) ||

      (d.email ?? '')
        .toLowerCase()
        .includes(term) ||

      (d.position ?? '')
        .toLowerCase()
        .includes(term) ||

      (d.professionalDegrees ?? '')
        .toLowerCase()
        .includes(term) ||

      (d.qualificationsDesc ?? '')
        .toLowerCase()
        .includes(term)
    );
  }

  buscar(): void {
    const term = this.busqueda.trim();

    if (!term) {
      this.cargarDocentes();
      return;
    }

    this.cargando = true;
    this.errorCarga = '';

    this.docentesService.buscar(term).subscribe({
      next: (res) => {
        this.docentes = (res.data ?? []).map(
          docente => this.prepararDocente(docente)
        );

        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;

        if (err.status === 404) {
          this.docentes = [];
        } else {
          this.errorCarga =
            err.error?.message ??
            'Error al buscar docentes.';
        }
      }
    });
  }

  verDocente(
    docente: TeachingResponseDTO
  ): void {
    this.docenteSeleccionado =
      this.prepararDocente(docente);

    this.mostrarPerfil = true;
  }

  cerrarPerfil(): void {
    this.mostrarPerfil = false;
    this.docenteSeleccionado = null;
  }

  editarDesdePerfil(): void {
    if (!this.docenteSeleccionado) {
      return;
    }

    const docente = this.docenteSeleccionado;

    this.cerrarPerfil();
    this.abrirEdicion(docente);
  }

  abrirFormulario(): void {
    this.docenteEnEdicion = null;
    this.form = emptyForm();
    this.errorFormulario = '';
    this.mostrarMasCampos = false;
    this.mostrarFormulario = true;
  }

  abrirEdicion(
    docente: TeachingResponseDTO
  ): void {
    this.docenteEnEdicion = docente;
    this.form = formDesdeDocente(docente);
    this.errorFormulario = '';
    this.mostrarMasCampos = true;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    if (this.guardando) {
      return;
    }

    this.mostrarFormulario = false;
    this.docenteEnEdicion = null;
    this.errorFormulario = '';
  }

  guardarDocente(): void {
    this.errorFormulario = '';

    const camposBase =
      !this.form.name?.trim() ||
      !this.form.surnames?.trim() ||
      !this.form.email?.trim() ||
      !this.form.document?.trim() ||
      !this.form.birthdate ||
      !this.form.professionalDegrees?.trim() ||
      !this.form.gender ||
      !this.form.bloodType ||
      !this.form.position?.trim();

    if (camposBase) {
      this.errorFormulario =
        this.docenteEnEdicion
          ? 'Completa todos los campos obligatorios para guardar los cambios.'
          : 'Por favor completa todos los campos obligatorios.';

      return;
    }

    this.guardando = true;

    const peticion = this.docenteEnEdicion
      ? this.docentesService.actualizar(
          this.docenteEnEdicion.idUser,
          this.form
        )
      : this.docentesService.crear(
          this.form
        );

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.docenteEnEdicion = null;
        this.form = emptyForm();
        this.cargarDocentes();
      },
      error: (err) => {
        this.guardando = false;

        this.errorFormulario =
          err.error?.message ??
          (
            this.docenteEnEdicion
              ? 'No se pudo actualizar el docente.'
              : 'No se pudo registrar el docente.'
          );
      }
    });
  }

  eliminarDocente(
    docente: TeachingResponseDTO
  ): void {
    this.docenteParaEliminar = docente;
    this.errorEliminacion = '';
    this.mostrarConfirmacionEliminar = true;
  }

  cerrarConfirmacionEliminar(): void {
    if (this.eliminando) {
      return;
    }

    this.mostrarConfirmacionEliminar = false;
    this.docenteParaEliminar = null;
    this.errorEliminacion = '';
  }

  confirmarEliminacion(): void {
    if (!this.docenteParaEliminar) {
      return;
    }

    const id = this.docenteParaEliminar.idUser;

    this.eliminando = true;
    this.errorEliminacion = '';

    this.docentesService.eliminar(id).subscribe({
      next: () => {
        this.docentes = this.docentes.filter(
          d => d.idUser !== id
        );

        if (
          this.docenteSeleccionado?.idUser === id
        ) {
          this.cerrarPerfil();
        }

        this.eliminando = false;
        this.mostrarConfirmacionEliminar = false;
        this.docenteParaEliminar = null;
      },
      error: (err) => {
        this.eliminando = false;

        this.errorEliminacion =
          err.error?.message ??
          'No se pudo eliminar el docente. Intenta de nuevo.';
      }
    });
  }

  obtenerNombreInstitucion(
    idInstitution: number | null | undefined
  ): string {
    if (!idInstitution) {
      return 'No registrada';
    }

    if (idInstitution === ID_INSTITUCION_FIJO) {
      return 'Institución Educativa';
    }

    return `Institución ${idInstitution}`;
  }
}