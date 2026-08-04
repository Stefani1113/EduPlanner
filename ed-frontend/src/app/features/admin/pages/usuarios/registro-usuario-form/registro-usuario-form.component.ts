import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  UsuariosService,
  ID_ROL_ADMINISTRADOR,
  ID_ROL_DOCENTE,
  ID_ROL_ESTUDIANTE,
  ID_ROL_DIRECTIVO
} from '../../../services/usuarios.service';

interface RolOpcion {
  idRole: number;
  label: string;
}

@Component({
  selector: 'app-registro-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-usuario-form.component.html',
  styleUrl: './registro-usuario-form.component.scss'
})
export class RegistroUsuarioFormComponent {

  @Output() registrado = new EventEmitter<void>();

  roles: RolOpcion[] = [
    { idRole: ID_ROL_ADMINISTRADOR, label: 'Administrador' },
    { idRole: ID_ROL_DOCENTE, label: 'Docente' },
    { idRole: ID_ROL_ESTUDIANTE, label: 'Estudiante' },
    { idRole: ID_ROL_DIRECTIVO, label: 'Directivo' }
  ];

  readonly ID_ROL_ESTUDIANTE = ID_ROL_ESTUDIANTE;

  enviando = false;
  mensajeExito = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private usuariosService: UsuariosService) {
    this.form = this.fb.group({
      idRole: [ID_ROL_DOCENTE, Validators.required],
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      documentType: ['CC', Validators.required],
      document: ['', Validators.required],

      // Solo Administrador / Docente / Directivo
      position: [''],

      // Solo Estudiante
      birthdate: [''],
      guardianName: [''],
      guardianPhone: ['']
    });

    this.form.get('idRole')!.valueChanges.subscribe(() => this.actualizarValidadores());
    this.actualizarValidadores();
  }

  get esEstudiante(): boolean {
    return Number(this.form.get('idRole')!.value) === ID_ROL_ESTUDIANTE;
  }

  get tituloRolSeleccionado(): string {
    return this.roles.find(r => r.idRole === Number(this.form.get('idRole')!.value))?.label ?? '';
  }

  private actualizarValidadores(): void {
    const position = this.form.get('position')!;
    const birthdate = this.form.get('birthdate')!;
    const guardianName = this.form.get('guardianName')!;
    const guardianPhone = this.form.get('guardianPhone')!;

    if (this.esEstudiante) {
      position.clearValidators();
      birthdate.setValidators(Validators.required);
      guardianName.setValidators(Validators.required);
      guardianPhone.setValidators(Validators.required);
    } else {
      position.setValidators(Validators.required);
      birthdate.clearValidators();
      guardianName.clearValidators();
      guardianPhone.clearValidators();
    }

    position.updateValueAndValidity({ emitEvent: false });
    birthdate.updateValueAndValidity({ emitEvent: false });
    guardianName.updateValueAndValidity({ emitEvent: false });
    guardianPhone.updateValueAndValidity({ emitEvent: false });
  }

  registrar(): void {
    this.mensajeExito = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    this.enviando = true;

    if (this.esEstudiante) {
      this.usuariosService.registrarEstudiante({
        name: v.name,
        surnames: v.surnames,
        email: v.email,
        phoneNumber: v.phoneNumber,
        document: v.document,
        documentType: v.documentType,
        birthdate: v.birthdate || null,
        guardian: {
          guardianName: v.guardianName,
          guardianPhone: v.guardianPhone
        }
      }).subscribe({
        next: () => this.onExito(),
        error: (err) => this.onError(err)
      });
    } else {
      this.usuariosService.registrarPersonal({
        name: v.name,
        surnames: v.surnames,
        email: v.email,
        phoneNumber: v.phoneNumber,
        document: v.document,
        documentType: v.documentType,
        position: v.position,
        idRole: Number(v.idRole)
      }).subscribe({
        next: () => this.onExito(),
        error: (err) => this.onError(err)
      });
    }
  }

  private onExito(): void {
    this.enviando = false;
    this.mensajeExito = `${this.tituloRolSeleccionado} registrado correctamente. Se envió un correo de activación.`;
    const idRoleActual = this.form.get('idRole')!.value;
    this.form.reset({
      idRole: idRoleActual,
      documentType: 'CC'
    });
    this.actualizarValidadores();
    this.registrado.emit();
  }

  private onError(err: any): void {
    this.enviando = false;
    alert(err?.error?.message ?? 'No se pudo registrar el usuario. Intenta de nuevo.');
  }
}