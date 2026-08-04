import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsuariosService,
  ID_ROL_ADMINISTRADOR,
  ID_ROL_DOCENTE,
  ID_ROL_DIRECTIVO
} from '../../../services/usuarios.service';

interface RolOpcion {
  idRole: number;
  label: string;
}

const TRANSICIONES_PERMITIDAS: Record<number, number[]> = {
  [ID_ROL_DOCENTE]: [ID_ROL_ADMINISTRADOR, ID_ROL_DIRECTIVO],
  [ID_ROL_ADMINISTRADOR]: [ID_ROL_DIRECTIVO],
  [ID_ROL_DIRECTIVO]: [ID_ROL_ADMINISTRADOR]
};

const NOMBRES_ROL: Record<number, string> = {
  [ID_ROL_ADMINISTRADOR]: 'Administrador',
  [ID_ROL_DOCENTE]: 'Docente',
  [ID_ROL_DIRECTIVO]: 'Directivo'
};

@Component({
  selector: 'app-cambiar-rol-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-rol-modal.component.html',
  styleUrl: './cambiar-rol-modal.component.scss'
})
export class CambiarRolModalComponent implements OnChanges {

  @Input() idUser!: number;
  @Input() nombreUsuario = '';
  @Input() idRoleActual!: number;

  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();

  opciones: RolOpcion[] = [];
  idRoleDestino: number | null = null;
  position = '';
  enviando = false;
  error = '';

  constructor(private usuariosService: UsuariosService) {}

  ngOnChanges(): void {
    const permitidos = TRANSICIONES_PERMITIDAS[this.idRoleActual] ?? [];
    this.opciones = permitidos.map(id => ({ idRole: id, label: NOMBRES_ROL[id] }));
    this.idRoleDestino = this.opciones[0]?.idRole ?? null;
    this.position = '';
    this.error = '';
  }

  get requierePosicion(): boolean {
    return this.idRoleDestino === ID_ROL_ADMINISTRADOR || this.idRoleDestino === ID_ROL_DIRECTIVO;
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  confirmar(): void {
    this.error = '';

    if (!this.idRoleDestino) {
      this.error = 'Selecciona el nuevo rol.';
      return;
    }
    if (this.requierePosicion && !this.position.trim()) {
      this.error = 'Debes indicar el nuevo cargo para este rol.';
      return;
    }

    this.enviando = true;
    this.usuariosService.actualizarRol(this.idUser, {
      idRole: this.idRoleDestino,
      position: this.requierePosicion ? this.position.trim() : undefined
    }).subscribe({
      next: () => {
        this.enviando = false;
        this.actualizado.emit();
      },
      error: (err) => {
        this.enviando = false;
        this.error = err?.error?.message ?? 'No se pudo cambiar el rol del usuario.';
      }
    });
  }
}