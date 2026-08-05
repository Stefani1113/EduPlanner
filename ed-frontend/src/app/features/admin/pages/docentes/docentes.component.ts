import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DocentesService,
  TeachingRequestDTO,
  TeachingResponseDTO
} from '../../services/docentes.service';

const ID_INSTITUCION_FIJO = 1;

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

function formDesdeDocente(d: TeachingResponseDTO): TeachingRequestDTO {
  return {
    name: d.name,
    surnames: d.surnames,
    email: d.email,
    password: '',
    documentType: d.documentType,
    document: d.document,
    documentIssuePlace: d.documentIssuePlace ?? '',
    birthdate: d.birthdate,
    phoneNumber: d.phoneNumber ?? '',
    photoUrl: d.photoUrl ?? '',
    professionalDegrees: d.professionalDegrees,
    qualificationsDesc: d.qualificationsDesc ?? '',
    gender: d.gender,
    address: d.address ?? '',
    bloodType: d.bloodType,
    disabilities: d.disabilities ?? '',
    stratum: d.stratum,
    populationType: d.populationType ?? '',
    healthRegime: d.healthRegime ?? '',
    eps: d.eps ?? '',
    position: d.position,
    idInstitution: d.idInstitution ?? ID_INSTITUCION_FIJO
  };
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.scss'
})
export class DocentesComponent implements OnInit {

  docentes: TeachingResponseDTO[] = [];
  cargando = false;
  errorCarga = '';

  busqueda = '';

  mostrarFormulario = false;
  mostrarMasCampos = false;
  guardando = false;
  errorFormulario = '';

  docenteEnEdicion: TeachingResponseDTO | null = null;

  form: TeachingRequestDTO = emptyForm();

  constructor(private docentesService: DocentesService) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

  cargarDocentes(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.docentesService.listar().subscribe({
      next: (res) => {
        this.docentes = res.data ?? [];
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.errorCarga = err.error?.message
          ?? 'No se pudo cargar el listado de docentes. Verifica tu conexión con el servidor.';
      }
    });
  }

  get docentesFiltrados(): TeachingResponseDTO[] {
    const term = this.busqueda.trim().toLowerCase();
    if (!term) return this.docentes;
    return this.docentes.filter(d =>
      `${d.name} ${d.surnames}`.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      (d.position ?? '').toLowerCase().includes(term)
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
        this.docentes = res.data ?? [];
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 404) {
          this.docentes = [];
        } else {
          console.error(err);
          this.errorCarga = err.error?.message ?? 'Error al buscar docentes.';
        }
      }
    });
  }

  abrirFormulario(): void {
    this.docenteEnEdicion = null;
    this.form = emptyForm();
    this.errorFormulario = '';
    this.mostrarMasCampos = false;
    this.mostrarFormulario = true;
  }

  abrirEdicion(docente: TeachingResponseDTO): void {
    this.docenteEnEdicion = docente;
    this.form = formDesdeDocente(docente);
    this.errorFormulario = '';
    this.mostrarMasCampos = false;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.docenteEnEdicion = null;
  }

  guardarDocente(): void {
    this.errorFormulario = '';

    const camposBase = !this.form.name || !this.form.surnames || !this.form.email ||
        !this.form.document || !this.form.birthdate || !this.form.professionalDegrees ||
        !this.form.gender || !this.form.bloodType || !this.form.position;


    if (camposBase || !this.form.password) {
      this.errorFormulario = this.docenteEnEdicion
        ? 'Completa todos los campos obligatorios, incluida la contraseña, para guardar los cambios.'
        : 'Por favor completa todos los campos obligatorios.';
      return;
    }

    this.guardando = true;

    const peticion = this.docenteEnEdicion
      ? this.docentesService.actualizar(this.docenteEnEdicion.idUser, this.form)
      : this.docentesService.crear(this.form);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.docenteEnEdicion = null;
        this.cargarDocentes();
      },
      error: (err) => {
        console.error(err);
        this.guardando = false;
        this.errorFormulario = err.error?.message
          ?? (this.docenteEnEdicion ? 'No se pudo actualizar el docente.' : 'No se pudo registrar el docente.');
      }
    });
  }

  eliminarDocente(docente: TeachingResponseDTO): void {
    const confirmado = confirm(`¿Eliminar al docente ${docente.name} ${docente.surnames}?`);
    if (!confirmado) return;

    this.docentesService.eliminar(docente.idUser).subscribe({
      next: () => this.cargarDocentes(),
      error: (err) => {
        console.error(err);
        alert(err.error?.message ?? 'No se pudo eliminar el docente.');
      }
    });
  }
}
