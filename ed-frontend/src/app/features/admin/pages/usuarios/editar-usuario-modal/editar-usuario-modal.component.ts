import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  UserResponseDTO,
  TeachingRequestDTO,
  UpdateStudentDTO,
  UpdateStaffDTO,
  CourseBasicoDTO,
  UsuariosService
} from '../../../services/usuarios.service';

export type TipoEdicion = 'Docente' | 'Estudiante' | 'Staff';

export interface UsuarioEditado {
  tipo: TipoEdicion;
  id: number;
  payload: TeachingRequestDTO | UpdateStudentDTO | UpdateStaffDTO;
  idCourse?: number | null;
}

@Component({
  selector: 'app-editar-usuario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-usuario-modal.component.html',
  styleUrl: './editar-usuario-modal.component.scss'
})
export class EditarUsuarioModalComponent implements OnInit {
  @Input() tipo: TipoEdicion = 'Staff';
  @Input() usuario!: UserResponseDTO;
  @Input() guardando = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<UsuarioEditado>();

  form!: FormGroup;
  mostrarErrores = false;

  tiposDocumento = ['CC', 'TI', 'CE', 'PA', 'RC'];
  generos = ['Masculino', 'Femenino', 'Otro'];
  tiposSangre = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  estratos = [1, 2, 3, 4, 5, 6];

  cursosDisponibles: CourseBasicoDTO[] = [];
  cargandoCursos = false;

  constructor(private fb: FormBuilder, private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    const u = this.usuario;

    this.form = this.fb.group({
      name: [u?.name ?? '', Validators.required],
      surnames: [u?.surnames ?? '', Validators.required],
      documentType: [u?.documentType ?? 'CC', Validators.required],
      document: [u?.document ?? '', Validators.required],
      documentIssuePlace: [u?.documentIssuePlace ?? '', Validators.required],
      birthdate: [this.formatearFecha(u?.birthdate), Validators.required],
      gender: [u?.gender ?? '', Validators.required],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      phoneNumber: [u?.phoneNumber ?? '', Validators.required],
      address: [u?.address ?? '', Validators.required],
      bloodType: [u?.bloodType ?? '', Validators.required],
      stratum: [u?.stratum ?? '', Validators.required],
      disabilities: [u?.disabilities ?? ''],
      populationType: [u?.populationType ?? ''],
      healthRegime: [u?.healthRegime ?? ''],
      eps: [u?.eps ?? ''],
      position: [u?.position ?? '', Validators.required],
      professionalDegrees: [u?.professionalDegrees ?? ''],
      qualificationsDesc: [u?.qualificationsDesc ?? ''],
      idCourse: [u?.idCourse ?? '']
    });

    if (this.tipo !== 'Docente') {
      this.form.get('professionalDegrees')?.clearValidators();
      this.form.get('professionalDegrees')?.updateValueAndValidity();
      this.form.get('email')?.disable();
      this.form.get('documentType')?.disable();
      this.form.get('document')?.disable();
    } else {
      this.form.get('professionalDegrees')?.setValidators(Validators.required);
      this.form.get('professionalDegrees')?.updateValueAndValidity();
    }

    if (this.tipo === 'Estudiante') {
      this.form.get('idCourse')?.setValidators(Validators.required);
      this.form.get('idCourse')?.updateValueAndValidity();
      this.cargarCursos();
    }
  }


  private cargarCursos(): void {
    this.cargandoCursos = true;

    this.usuariosService.listarCursos().subscribe({
      next: res => {
        this.cursosDisponibles = (res.data ?? []).filter(c => c.status);
        this.cargandoCursos = false;
      },
      error: () => {
        this.cursosDisponibles = [];
        this.cargandoCursos = false;
      }
    });
  }

  get titulo(): string {
    return this.tipo === 'Docente'
      ? 'Editar docente'
      : this.tipo === 'Estudiante'
        ? 'Editar estudiante'
        : `Editar ${this.usuario?.roleName ?? 'usuario'}`;
  }

  campoInvalido(campo: string): boolean {
    const control = this.form?.get(campo);
    return !!control && control.invalid && (control.touched || this.mostrarErrores);
  }

  cancelar(): void {
    if (!this.guardando) this.cerrar.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (!this.guardando && event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  guardarCambios(): void {
    if (this.guardando) return;

    if (this.form.invalid) {
      this.mostrarErrores = true;
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (this.tipo === 'Docente') {
      const payload: TeachingRequestDTO = {
        name: v.name,
        surnames: v.surnames,
        email: v.email,
        documentType: v.documentType,
        document: v.document,
        documentIssuePlace: v.documentIssuePlace || undefined,
        birthdate: v.birthdate || null,
        phoneNumber: v.phoneNumber || undefined,
        professionalDegrees: v.professionalDegrees,
        qualificationsDesc: v.qualificationsDesc || undefined,
        gender: v.gender,
        address: v.address || undefined,
        bloodType: v.bloodType,
        disabilities: v.disabilities || undefined,
        stratum: Number(v.stratum),
        populationType: v.populationType || undefined,
        healthRegime: v.healthRegime || undefined,
        eps: v.eps || undefined,
        position: v.position
      };

      this.guardar.emit({ tipo: 'Docente', id: this.usuario.idUser, payload });
      return;
    }

    if (this.tipo === 'Estudiante') {
      const payload: UpdateStudentDTO = this.basePayload(v) as UpdateStudentDTO;
      const idCourse = v.idCourse === '' || v.idCourse === null || v.idCourse === undefined
        ? null
        : Number(v.idCourse);
      this.guardar.emit({ tipo: 'Estudiante', id: this.usuario.idUser, payload, idCourse });
      return;
    }

    const payload: UpdateStaffDTO = {
      ...this.basePayload(v),
      position: v.position
    };
    this.guardar.emit({ tipo: 'Staff', id: this.usuario.idUser, payload });
  }

  private basePayload(v: any): UpdateStudentDTO {
    return {
      name: v.name,
      surnames: v.surnames,
      phoneNumber: v.phoneNumber || undefined,
      documentIssuePlace: v.documentIssuePlace || undefined,
      gender: v.gender || undefined,
      birthdate: v.birthdate || null,
      address: v.address || undefined,
      bloodType: v.bloodType || undefined,
      disabilities: v.disabilities || undefined,
      stratum: v.stratum ? Number(v.stratum) : undefined,
      populationType: v.populationType || undefined,
      healthRegime: v.healthRegime || undefined,
      eps: v.eps || undefined
    };
  }

  private formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '';
    return String(fecha).substring(0, 10);
  }
}