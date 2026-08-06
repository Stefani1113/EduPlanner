import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TeachingRequestDTO,
  RegisterStudentDTO,
  RegisterStaffDTO,
  ID_ROL_ADMINISTRADOR,
  ID_ROL_DIRECTIVO
} from '../../../services/usuarios.service';

export type TipoRegistro = 'Docente' | 'Estudiante' | 'Staff';

// Id fijo de la institución (coincide con `institution.id` en application.yaml del backend)
const ID_INSTITUCION = 1;

export interface RegistroDocenteEvento {
  tipo: 'Docente';
  payload: TeachingRequestDTO;
}

export interface RegistroEstudianteEvento {
  tipo: 'Estudiante';
  payload: RegisterStudentDTO;
}

export interface RegistroStaffEvento {
  tipo: 'Staff';
  payload: RegisterStaffDTO;
}

export type UsuarioRegistrado = RegistroDocenteEvento | RegistroEstudianteEvento | RegistroStaffEvento;

@Component({
  selector: 'app-registro-usuario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registro-usuario-modal.component.html',
  styleUrl: './registro-usuario-modal.component.scss'
})
export class RegistroUsuarioModalComponent implements OnInit {

  @Input() tipo: TipoRegistro = 'Docente';
  @Input() guardando = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<UsuarioRegistrado>();

  fotoPreview: string | null = null;
  mostrarErroresValidacion = false;

  // Catálogos compartidos por los 3 formularios
  tiposDocumento = ['CC', 'TI', 'CE', 'PA', 'RC'];
  generos = ['Masculino', 'Femenino', 'Otro'];
  tiposSangre = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  estratos = [1, 2, 3, 4, 5, 6];

  rolesStaff: { label: string; idRole: number }[] = [
    { label: 'Administrador', idRole: ID_ROL_ADMINISTRADOR },
    { label: 'Directivo', idRole: ID_ROL_DIRECTIVO }
  ];

  titulosProfesionales: string[] = [];
  tituloNuevo = '';

  formDocente!: FormGroup;
  formEstudiante!: FormGroup;
  formStaff!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Docente -> se guarda vía POST /teacher (TeachingRequestDTO)
    this.formDocente = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      documentType: ['CC', Validators.required],
      document: ['', Validators.required],
      documentIssuePlace: [''],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', Validators.required],
      address: [''],
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

    // Estudiante -> se guarda vía POST /users/register/student (RegisterStudentDTO)
    this.formEstudiante = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      documentType: ['TI', Validators.required],
      document: ['', Validators.required],
      documentIssuePlace: [''],
      birthdate: [''],
      gender: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      bloodType: [''],
      stratum: [''],
      disabilities: [''],
      populationType: [''],
      healthRegime: [''],
      eps: [''],
      guardianName: ['', Validators.required],
      guardianPhone: ['', Validators.required]
    });

    // Administrador / Directivo -> se guarda vía POST /users/register/staff (RegisterStaffDTO)
    this.formStaff = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      documentType: ['CC', Validators.required],
      document: ['', Validators.required],
      documentIssuePlace: [''],
      birthdate: [''],
      gender: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      bloodType: [''],
      stratum: [''],
      disabilities: [''],
      populationType: [''],
      healthRegime: [''],
      eps: [''],
      position: ['', Validators.required],
      idRole: [ID_ROL_ADMINISTRADOR, Validators.required]
    });
  }

  get formActual(): FormGroup {
    if (this.tipo === 'Docente') return this.formDocente;
    if (this.tipo === 'Estudiante') return this.formEstudiante;
    return this.formStaff;
  }

  seleccionarRolStaff(idRole: number): void {
    this.formStaff.get('idRole')?.setValue(idRole);
  }

  seleccionarFoto(input: HTMLInputElement): void {
    input.click();
  }

  onFotoSeleccionada(event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => (this.fotoPreview = lector.result as string);
    lector.readAsDataURL(archivo);
  }

  agregarTitulo(): void {
    const valor = this.tituloNuevo.trim();
    if (!valor) return;

    this.titulosProfesionales = [...this.titulosProfesionales, valor];
    this.tituloNuevo = '';
  }

  quitarTitulo(titulo: string): void {
    this.titulosProfesionales = this.titulosProfesionales.filter(t => t !== titulo);
  }

  cancelar(): void {
    if (this.guardando) return;
    this.cerrar.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.guardando) return;
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  guardarUsuario(): void {
    if (this.guardando) return;

    if (this.formActual.invalid) {
      this.formActual.markAllAsTouched();
      this.mostrarErroresValidacion = true;
      return;
    }

    this.mostrarErroresValidacion = false;

    if (this.tipo === 'Docente') {
      this.emitirDocente();
    } else if (this.tipo === 'Estudiante') {
      this.emitirEstudiante();
    } else {
      this.emitirStaff();
    }
  }

  private emitirDocente(): void {
    const v = this.formDocente.value;

    const notas: string[] = [];
    if (v.asignaturas) notas.push(`Asignaturas: ${v.asignaturas}`);
    if (v.qualificationsDesc) notas.push(v.qualificationsDesc);

    const payload: TeachingRequestDTO = {
      name: v.name,
      surnames: v.surnames,
      email: v.email,
      password: v.password,
      documentType: v.documentType,
      document: v.document,
      documentIssuePlace: v.documentIssuePlace || undefined,
      birthdate: v.birthdate,
      phoneNumber: v.phoneNumber || undefined,
      photoUrl: undefined,
      professionalDegrees: this.titulosProfesionales.join(', ') || v.position,
      qualificationsDesc: notas.join(' | ') || undefined,
      gender: v.gender,
      address: v.address || undefined,
      bloodType: v.bloodType,
      disabilities: v.disabilities || undefined,
      stratum: Number(v.stratum),
      populationType: v.populationType || undefined,
      healthRegime: v.healthRegime || undefined,
      eps: v.eps || undefined,
      position: v.position,
      idInstitution: ID_INSTITUCION
    };

    this.guardar.emit({ tipo: 'Docente', payload });
  }

  private emitirEstudiante(): void {
    const v = this.formEstudiante.value;

    const payload: RegisterStudentDTO = {
      name: v.name,
      surnames: v.surnames,
      email: v.email,
      phoneNumber: v.phoneNumber || undefined,
      document: v.document,
      documentType: v.documentType,
      documentIssuePlace: v.documentIssuePlace || undefined,
      gender: v.gender || undefined,
      birthdate: v.birthdate || null,
      address: v.address || undefined,
      bloodType: v.bloodType || undefined,
      disabilities: v.disabilities || undefined,
      stratum: v.stratum ? Number(v.stratum) : undefined,
      populationType: v.populationType || undefined,
      healthRegime: v.healthRegime || undefined,
      eps: v.eps || undefined,
      guardian: {
        guardianName: v.guardianName,
        guardianPhone: v.guardianPhone
      }
    };

    this.guardar.emit({ tipo: 'Estudiante', payload });
  }

  private emitirStaff(): void {
    const v = this.formStaff.value;

    const payload: RegisterStaffDTO = {
      name: v.name,
      surnames: v.surnames,
      email: v.email,
      phoneNumber: v.phoneNumber || undefined,
      document: v.document,
      documentType: v.documentType,
      documentIssuePlace: v.documentIssuePlace || undefined,
      gender: v.gender || undefined,
      birthdate: v.birthdate || undefined,
      address: v.address || undefined,
      bloodType: v.bloodType || undefined,
      disabilities: v.disabilities || undefined,
      stratum: v.stratum ? Number(v.stratum) : undefined,
      populationType: v.populationType || undefined,
      healthRegime: v.healthRegime || undefined,
      eps: v.eps || undefined,
      position: v.position,
      idRole: Number(v.idRole)
    };

    this.guardar.emit({ tipo: 'Staff', payload });
  }
}