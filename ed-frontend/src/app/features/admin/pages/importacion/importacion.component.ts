import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-importacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './importacion.component.html',
  styleUrls: ['./importacion.component.scss']
})
export class ImportacionComponent {

  archivo!: File;

  constructor(private http: HttpClient) {}

  seleccionarArchivo(event: any): void {
    if (event.target.files.length > 0) {
      this.archivo = event.target.files[0];
    }
  }

  importar(): void {
    if (!this.archivo) {
      alert('Seleccione un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', this.archivo);

    this.http.post('http://localhost:8080/api/usuarios/importar', formData)
      .subscribe({
        next: (response) => {
          console.log(response);
          alert('Importación exitosa');
        },
        error: (error) => {
          console.error(error);
          alert('Error al importar');
        }
      });
  }
}