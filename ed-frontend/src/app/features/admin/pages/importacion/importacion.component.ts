import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportacionService } from '../../services/importacion.service';

interface ImportErrorDetail {
  rowNumber: number;
  rowData: string;
  error: string;
}

interface ImportReport {
  idImport: number;
  fileName: string;
  importDate: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ImportErrorDetail[];
}

type TipoError = 'DUPLICADO' | 'FILA_INCOMPLETA' | 'FORMATO_INVALIDO' | 'OTRO';

@Component({
  selector: 'app-importacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './importacion.component.html',
  styleUrls: ['./importacion.component.scss']
})
export class ImportacionComponent {

  archivo!: File;

  cargando = false;

  vista: 'formulario' | 'reporte' = 'formulario';

  reporte: ImportReport | null = null;

  errorGeneral: string | null = null;

  constructor(private service: ImportacionService) {}

  seleccionarArchivo(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.archivo = input.files[0];
    }

  }

  importar(): void {

    if (!this.archivo) {
      alert('Seleccione un archivo Excel');
      return;
    }

    this.cargando = true;
    this.errorGeneral = null;

    this.service.importarExcel(this.archivo).subscribe({

      next: (resp: any) => {
        const idImport = resp?.data;

        if (idImport) {
          this.verReporte(idImport);
        } else {
          this.cargando = false;
          alert(resp?.message || 'Importación realizada correctamente');
        }
      },

      error: (err) => {

        this.cargando = false;
        alert(err?.error?.message || 'Ocurrió un error al importar el archivo');

      }

    });

  }


  verReporte(idImport: number): void {

    this.cargando = true;

    this.service.obtenerReporte(idImport).subscribe({

      next: (resp: any) => {
        this.cargando = false;
        this.reporte = resp?.data ?? null;
        this.vista = 'reporte';
      },

      error: (err) => {
        this.cargando = false;
        this.errorGeneral = err?.error?.message || 'No se pudo cargar el reporte de importación';
      }

    });

  }


  volver(): void {
    this.vista = 'formulario';
    this.reporte = null;
    this.archivo = null as any;
  }


  private clasificar(mensaje: string): { tipo: TipoError; campo: string | null } {

    const texto = (mensaje || '').toLowerCase();

    if (texto.includes('ya está registrado') || texto.includes('ya esta registrado')) {
      if (texto.includes('correo')) return { tipo: 'DUPLICADO', campo: 'Correo' };
      if (texto.includes('documento')) return { tipo: 'DUPLICADO', campo: 'Documento' };
      if (texto.includes('celular') || texto.includes('teléfono') || texto.includes('telefono')) {
        return { tipo: 'DUPLICADO', campo: 'Teléfono' };
      }
      return { tipo: 'DUPLICADO', campo: null };
    }

    if (texto.includes('la fila tiene') && texto.includes('columnas')) {
      return { tipo: 'FILA_INCOMPLETA', campo: null };
    }

    if (texto.includes('could not be parsed') || texto.includes('date') || texto.includes('parse')) {
      return { tipo: 'FORMATO_INVALIDO', campo: 'Fecha de nacimiento' };
    }

    if (texto.includes('for input string')) {
      return { tipo: 'FORMATO_INVALIDO', campo: 'Estrato' };
    }

    return { tipo: 'OTRO', campo: null };
  }

  etiquetaTipoError(mensaje: string): string {
    switch (this.clasificar(mensaje).tipo) {
      case 'DUPLICADO': return 'Duplicado';
      case 'FILA_INCOMPLETA': return 'Fila incompleta';
      case 'FORMATO_INVALIDO': return 'Formato inválido';
      default: return 'Otro error';
    }
  }


  claseTipoError(mensaje: string): string {
    switch (this.clasificar(mensaje).tipo) {
      case 'DUPLICADO': return 'badge-duplicado';
      case 'FILA_INCOMPLETA': return 'badge-fila';
      case 'FORMATO_INVALIDO': return 'badge-formato';
      default: return 'badge-otro';
    }
  }

  
  campoAfectado(mensaje: string): string {
    return this.clasificar(mensaje).campo || '—';
  }

}
