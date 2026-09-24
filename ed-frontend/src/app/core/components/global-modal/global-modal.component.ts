import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-global-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-modal.component.html',
  styleUrl: './global-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalModalComponent {

  modal$;

  constructor(
    private modalService: ModalService
  ) {
    this.modal$ = this.modalService.modal$;
  }

  confirmar(): void {
    this.modalService.responder(true);
  }

  cancelar(): void {
    this.modalService.responder(false);
  }

  cerrar(): void {
    this.modalService.responder(false);
  }

  obtenerIcono(tipo: string): string {
    const iconos: Record<string, string> = {
      success: '✓',
      error: '×',
      warning: '!',
      info: 'i',
      confirm: '?',
      question: '?'
    };

    return iconos[tipo] ?? 'i';
  }
}