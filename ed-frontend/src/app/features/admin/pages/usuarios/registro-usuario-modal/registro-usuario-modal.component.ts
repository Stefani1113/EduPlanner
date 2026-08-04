import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

export interface RegistroDocentePayload {
  tipo: 'Docente';
  nombreCompleto: string;
  cedula: string;
  correo: string;
  telefono: string;
}

export interface RegistroEstudiantePayload {
  tipo: 'Estudiante';
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
}

export type UsuarioRegistrado = RegistroDocentePayload | RegistroEstudiantePayload;

@Component({
  selector: 'app-registro-usuario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registro-usuario-modal.component.html',
  styleUrl: './registro-usuario-modal.component.scss'
})
export class RegistroUsuarioModalComponent implements OnInit {

  @Input() tipo: 'Docente' | 'Estudiante' = 'Docente';
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<UsuarioRegistrado>();

  fotoPreview: string | null = null;

  areasAcademicas = ['Matemáticas', 'Ciencias Naturales', 'Español', 'Ciencias Sociales', 'Inglés', 'Educación Física', 'Artística'];
  gradosGrupo = ['1° A Bachillerato', '2° A Bachillerato', '3° A Bachillerato'];

  titulosProfesionales: string[] = [];
  tituloNuevo = '';

  formDocente!: FormGroup;
  formEstudiante!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formDocente = this.fb.group({
      nombreCompleto: ['', Validators.required],
      cedula: ['', Validators.required],
      areaAcademica: ['', Validators.required],
      estado: ['Activo', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      asignaturas: [''],
      observacion: ['']
    });

    this.formEstudiante = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      gradoGrupo: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['']
    });
  }

  get formActual(): FormGroup {
    return this.tipo === 'Docente' ? this.formDocente : this.formEstudiante;
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
    this.cerrar.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  guardarUsuario(): void {
    if (this.formActual.invalid) {
      this.formActual.markAllAsTouched();
      return;
    }

    if (this.tipo === 'Docente') {
      const v = this.formDocente.value;
      this.guardar.emit({
        tipo: 'Docente',
        nombreCompleto: v.nombreCompleto,
        cedula: v.cedula,
        correo: v.correo,
        telefono: v.telefono
      });
    } else {
      const v = this.formEstudiante.value;
      this.guardar.emit({
        tipo: 'Estudiante',
        nombres: v.nombres,
        apellidos: v.apellidos,
        documento: v.documento,
        fechaNacimiento: v.fechaNacimiento,
        correo: v.correo,
        telefono: v.telefono
      });
    }
  }
}