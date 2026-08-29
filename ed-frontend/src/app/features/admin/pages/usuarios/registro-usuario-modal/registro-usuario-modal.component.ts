import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RegisterTeacherDTO,
  RegisterStudentDTO,
  RegisterStaffDTO,
  ID_ROL_ADMINISTRADOR,
  ID_ROL_DIRECTIVO
} from '../../../services/usuarios.service';

import { ModalService } from '../../../../../core/services/modal.service';

export type TipoRegistro = 'Docente' | 'Estudiante' | 'Staff';

export interface RegistroDocenteEvento {
  tipo: 'Docente';
  payload: RegisterTeacherDTO;
}

export interface RegistroEstudianteEvento {
  tipo: 'Estudiante';
  payload: RegisterStudentDTO;
}

export interface RegistroStaffEvento {
  tipo: 'Staff';
  payload: RegisterStaffDTO;
}

export type UsuarioRegistrado =
  | RegistroDocenteEvento
  | RegistroEstudianteEvento
  | RegistroStaffEvento;

@Component({
  selector: 'app-registro-usuario-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './registro-usuario-modal.component.html',
  styleUrl: './registro-usuario-modal.component.scss'
})
export class RegistroUsuarioModalComponent implements OnInit {

  @Input() tipo: TipoRegistro = 'Docente';
  @Input() guardando = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<UsuarioRegistrado>();

  mostrarErroresValidacion = false;

  tiposDocumento = ['CC', 'TI', 'CE', 'PA', 'RC'];

  generos = [
    'Masculino',
    'Femenino',
    'Otro'
  ];

  tiposSangre = [
    'O+',
    'O-',
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-'
  ];

  estratos = [1, 2, 3, 4, 5, 6];

  rolesStaff: { label: string; idRole: number }[] = [
    {
      label: 'Administrador',
      idRole: ID_ROL_ADMINISTRADOR
    },
    {
      label: 'Directivo',
      idRole: ID_ROL_DIRECTIVO
    }
  ];

  titulosProfesionales: string[] = [];
  tituloNuevo = '';

  formDocente!: FormGroup;
  formEstudiante!: FormGroup;
  formStaff!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.formDocente = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      documentType: ['CC', Validators.required],
      document: ['', Validators.required],
      documentIssuePlace: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      bloodType: ['', Validators.required],
      stratum: ['', Validators.required],
      disabilities: [''],
      populationType: [''],
      healthRegime: [''],
      eps: [''],
      position: ['', Validators.required],
      asignaturas: [''],
      qualificationsDesc: ['']
    });

    this.formEstudiante = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      documentType: ['TI', Validators.required],
      document: ['', Validators.required],
      documentIssuePlace: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      bloodType: ['', Validators.required],
      stratum: ['', Validators.required],
      disabilities: [''],
      populationType: [''],
      healthRegime: [''],
      eps: [''],
      guardianName: ['', Validators.required],
      guardianPhone: ['', Validators.required]
    });

    this.formStaff = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      documentType: ['CC', Validators.required],
      document: ['', Validators.required],
      documentIssuePlace: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      bloodType: ['', Validators.required],
      stratum: ['', Validators.required],
      disabilities: [''],
      populationType: [''],
      healthRegime: [''],
      eps: [''],
      position: ['', Validators.required],
      idRole: [ID_ROL_ADMINISTRADOR, Validators.required]
    });
  }

  get formActual(): FormGroup {
    if (this.tipo === 'Docente') {
      return this.formDocente;
    }

    if (this.tipo === 'Estudiante') {
      return this.formEstudiante;
    }

    return this.formStaff;
  }

  campoInvalido(campo: string): boolean {
    const control = this.formDocente.get(campo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || this.mostrarErroresValidacion)
    );
  }

  campoInvalidoEstudiante(campo: string): boolean {
    const control = this.formEstudiante.get(campo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || this.mostrarErroresValidacion)
    );
  }

  campoInvalidoStaff(campo: string): boolean {
    const control = this.formStaff.get(campo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || this.mostrarErroresValidacion)
    );
  }

  seleccionarRolStaff(idRole: number): void {
    this.formStaff.get('idRole')?.setValue(idRole);
    this.formStaff.get('idRole')?.markAsTouched();
  }

  agregarTitulo(): void {
    const valor = this.tituloNuevo.trim();

    if (!valor) {
      return;
    }

    this.titulosProfesionales = [
      ...this.titulosProfesionales,
      valor
    ];

    this.tituloNuevo = '';
  }

  quitarTitulo(titulo: string): void {
    this.titulosProfesionales =
      this.titulosProfesionales.filter(t => t !== titulo);
  }

  cancelar(): void {
    if (this.guardando) {
      return;
    }

    this.cerrar.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.guardando) {
      return;
    }

    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  mostrarExito(
    mensaje: string,
    autoCerrar: boolean = true
  ): void {
    this.mostrarErroresValidacion = false;

    this.modalService.success(mensaje).then(() => {
      if (autoCerrar) {
        this.cerrar.emit();
      }
    });
  }

  mostrarError(mensaje: string): void {
    this.mostrarErroresValidacion = false;
    this.modalService.error(mensaje);
  }

  guardarUsuario(): void {
    if (this.guardando) {
      return;
    }

    const formulario = this.formActual;

    if (formulario.invalid) {
      this.mostrarErroresValidacion = true;
      formulario.markAllAsTouched();

      const primerInvalido = document.querySelector(
        '.field.error input, .field.error select'
      );

      if (primerInvalido) {
        primerInvalido.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        (primerInvalido as HTMLElement).focus();
      }

      return;
    }

    this.mostrarErroresValidacion = false;

    try {
      if (this.tipo === 'Docente') {
        this.emitirDocente();
      } else if (this.tipo === 'Estudiante') {
        this.emitirEstudiante();
      } else {
        this.emitirStaff();
      }
    } catch (error) {
      console.error(
        'Error al procesar el formulario:',
        error
      );

      this.mostrarError(
        'Ocurrió un error al procesar el formulario.'
      );
    }
  }

  private emitirDocente(): void {
    const v = this.formDocente.value;

    const notas: string[] = [];

    if (v.asignaturas) {
      notas.push(`Asignaturas: ${v.asignaturas}`);
    }

    if (v.qualificationsDesc) {
      notas.push(v.qualificationsDesc);
    }

    const payload: RegisterTeacherDTO = {
      name: v.name,
      surnames: v.surnames,
      email: v.email,
      documentType: v.documentType,
      document: v.document,
      documentIssuePlace:
        v.documentIssuePlace || undefined,
      birthdate: v.birthdate,
      phoneNumber:
        v.phoneNumber || undefined,
      professionalDegrees:
        this.titulosProfesionales.join(', ') ||
        v.position,
      qualificationsDesc:
        notas.join(' | ') ||
        undefined,
      gender: v.gender,
      address:
        v.address || undefined,
      bloodType: v.bloodType,
      disabilities:
        v.disabilities || undefined,
      stratum:
        Number(v.stratum),
      populationType:
        v.populationType || undefined,
      healthRegime:
        v.healthRegime || undefined,
      eps:
        v.eps || undefined,
      position:
        v.position
    };

    this.guardar.emit({
      tipo: 'Docente',
      payload
    });
  }

  private emitirEstudiante(): void {
    const v = this.formEstudiante.value;

    const payload: RegisterStudentDTO = {
      name: v.name,
      surnames: v.surnames,
      email: v.email,
      phoneNumber:
        v.phoneNumber || undefined,
      document:
        v.document,
      documentType:
        v.documentType,
      documentIssuePlace:
        v.documentIssuePlace || undefined,
      gender:
        v.gender || undefined,
      birthdate:
        v.birthdate || null,
      address:
        v.address || undefined,
      bloodType:
        v.bloodType || undefined,
      disabilities:
        v.disabilities || undefined,
      stratum:
        v.stratum
          ? Number(v.stratum)
          : undefined,
      populationType:
        v.populationType || undefined,
      healthRegime:
        v.healthRegime || undefined,
      eps:
        v.eps || undefined,
      guardian: {
        guardianName:
          v.guardianName,
        guardianPhone:
          v.guardianPhone
      }
    };

    this.guardar.emit({
      tipo: 'Estudiante',
      payload
    });
  }

  private emitirStaff(): void {
    const v = this.formStaff.value;

    const payload: RegisterStaffDTO = {
      name: v.name,
      surnames: v.surnames,
      email: v.email,
      phoneNumber:
        v.phoneNumber || undefined,
      document:
        v.document,
      documentType:
        v.documentType,
      documentIssuePlace:
        v.documentIssuePlace || undefined,
      gender:
        v.gender || undefined,
      birthdate:
        v.birthdate || undefined,
      address:
        v.address || undefined,
      bloodType:
        v.bloodType || undefined,
      disabilities:
        v.disabilities || undefined,
      stratum:
        v.stratum
          ? Number(v.stratum)
          : undefined,
      populationType:
        v.populationType || undefined,
      healthRegime:
        v.healthRegime || undefined,
      eps:
        v.eps || undefined,
      position:
        v.position,
      idRole:
        Number(v.idRole)
    };

    this.guardar.emit({
      tipo: 'Staff',
      payload
    });
  }

  onGuardadoExitoso(mensaje?: string): void {
    const texto =
      mensaje ||
      `${this.tipo} registrado correctamente.`;

    this.mostrarExito(
      texto,
      true
    );
  }

  onErrorGuardado(mensaje?: string): void {
    this.mostrarError(
      mensaje ||
      `Error al registrar ${this.tipo.toLowerCase()}.`
    );
  }

  onGuardadoExitosoYCerrar(mensaje?: string): void {
    const texto =
      mensaje ||
      `${this.tipo} registrado correctamente.`;

    this.modalService.success(texto).then(() => {
      this.cerrar.emit();
    });
  }
}
