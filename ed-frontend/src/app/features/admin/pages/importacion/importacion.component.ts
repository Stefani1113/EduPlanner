import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportacionService } from '../../services/importacion.service';

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

    this.service.importarExcel(this.archivo).subscribe({

      next: (resp: any) => {

        this.cargando = false;
        alert(resp.message || 'Importación realizada correctamente');

      },

      error: (err) => {

        this.cargando = false;
        alert(err?.error?.message || 'Ocurrió un error al importar el archivo');

      }

    });

  }

}