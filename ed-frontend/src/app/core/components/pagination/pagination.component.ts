import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges {

  /** Total de elementos de la lista completa */
  @Input() totalItems = 0;

  /** Elementos mostrados por página (10 en 10 por defecto) */
  @Input() pageSize = 10;

  /** Página actual (1-indexada) */
  @Input() currentPage = 1;

  /** Se emite cuando el usuario cambia de página */
  @Output() pageChange = new EventEmitter<number>();

  totalPages = 1;

  ngOnChanges(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalItems / this.pageSize)
    );

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get inicioRango(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.totalItems
    );
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages || pagina === this.currentPage) {
      return;
    }

    this.currentPage = pagina;
    this.pageChange.emit(this.currentPage);
  }

  anterior(): void {
    this.irAPagina(this.currentPage - 1);
  }

  siguiente(): void {
    this.irAPagina(this.currentPage + 1);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
