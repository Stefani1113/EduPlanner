import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Docente {
  id: number;
  nombre: string;
  apellidos: string;
  area: string;
  disponibilidad: string;
  horasSemana: number;
  imagen: string;
  fotoPerfil?: string;
}

interface Asignatura {
  id: number;
  nombre: string;
  horasSemana: number;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss'
})
export class HorariosComponent implements OnInit {
  mostrarDatos = false;
  mostrarFormularioDocente = false;
  editandoDocente = false;
  mostrarFormularioAsignatura = false;
  editandoAsignatura = false;

  docentes: Docente[] = [];
  asignaturas: Asignatura[] = [];
  docenteSeleccionado: Docente | null = null;
  asignaturaSeleccionada: Asignatura | null = null;

  // URL de la imagen para el botón
  imagenBoton: string = '';

  formularioDocente: Docente = {
    id: 0,
    nombre: '',
    apellidos: '',
    area: '',
    disponibilidad: '',
    horasSemana: 0,
    imagen: '',
    fotoPerfil: ''
  };

  formularioAsignatura: Asignatura = {
    id: 0,
    nombre: '',
    horasSemana: 0
  };

  constructor() {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarImagenBoton();
  }

  // =========================================
  // GESTIÓN DE DATOS CON LOCALSTORAGE
  // =========================================

  cargarDatos(): void {
    // Cargar docentes
    const docentesGuardados = localStorage.getItem('docentes');
    if (docentesGuardados) {
      this.docentes = JSON.parse(docentesGuardados);
    } else {
      // Datos por defecto
      this.docentes = [
        {
          id: 1,
          nombre: 'Luz Elena',
          apellidos: 'García',
          area: 'Biología',
          disponibilidad: 'L - V / 7 - 11 H',
          horasSemana: 28,
          imagen: '',
          fotoPerfil: ''
        }
      ];
      this.guardarDocentes();
    }

    // Cargar asignaturas
    const asignaturasGuardadas = localStorage.getItem('asignaturas');
    if (asignaturasGuardadas) {
      this.asignaturas = JSON.parse(asignaturasGuardadas);
    } else {
      this.asignaturas = [
        { id: 1, nombre: 'Matemáticas', horasSemana: 80 },
        { id: 2, nombre: 'Biología', horasSemana: 90 },
        { id: 3, nombre: 'Física', horasSemana: 40 }
      ];
      this.guardarAsignaturas();
    }
  }

  guardarDocentes(): void {
    localStorage.setItem('docentes', JSON.stringify(this.docentes));
  }

  guardarAsignaturas(): void {
    localStorage.setItem('asignaturas', JSON.stringify(this.asignaturas));
  }

  // =========================================
  // IMAGEN DEL BOTÓN
  // =========================================

  cargarImagenBoton(): void {
    const imagen = localStorage.getItem('imagenBoton');
    if (imagen) {
      this.imagenBoton = imagen;
    }
  }

  guardarImagenBoton(url: string): void {
    this.imagenBoton = url;
    localStorage.setItem('imagenBoton', url);
  }

  // =========================================
  // ABRIR/CERRAR PANEL
  // =========================================

  abrirDatos(): void {
    this.mostrarDatos = true;
  }

  cerrarDatos(): void {
    this.mostrarDatos = false;
  }

  // =========================================
  // DOCENTES - CRUD
  // =========================================

  seleccionarDocente(docente: Docente): void {
    this.docenteSeleccionado = docente;
  }

  abrirAgregarDocente(): void {
    this.editandoDocente = false;
    this.formularioDocente = {
      id: 0,
      nombre: '',
      apellidos: '',
      area: '',
      disponibilidad: '',
      horasSemana: 0,
      imagen: '',
      fotoPerfil: ''
    };
    this.mostrarFormularioDocente = true;
  }

  abrirEditarDocente(): void {
    if (!this.docenteSeleccionado) return;
    this.editandoDocente = true;
    this.formularioDocente = { ...this.docenteSeleccionado };
    this.mostrarFormularioDocente = true;
  }

  cerrarFormularioDocente(): void {
    this.mostrarFormularioDocente = false;
  }

  guardarDocente(): void {
    if (!this.formularioDocente.nombre || !this.formularioDocente.area) {
      alert('Completa los datos obligatorios.');
      return;
    }

    if (this.editandoDocente) {
      const indice = this.docentes.findIndex(d => d.id === this.formularioDocente.id);
      if (indice !== -1) {
        this.docentes[indice] = { ...this.formularioDocente };
      }
    } else {
      const nuevoId = this.docentes.length > 0 
        ? Math.max(...this.docentes.map(d => d.id)) + 1 
        : 1;
      this.docentes.push({
        ...this.formularioDocente,
        id: nuevoId
      });
    }

    this.guardarDocentes();
    this.cerrarFormularioDocente();
  }

  eliminarDocente(): void {
    if (!this.docenteSeleccionado) return;
    const confirmar = confirm(`¿Deseas eliminar a ${this.docenteSeleccionado.nombre}?`);
    if (!confirmar) return;

    this.docentes = this.docentes.filter(d => d.id !== this.docenteSeleccionado!.id);
    this.guardarDocentes();
    this.docenteSeleccionado = null;
  }

  // =========================================
  // ASIGNATURAS - CRUD
  // =========================================

  seleccionarAsignatura(asignatura: Asignatura): void {
    this.asignaturaSeleccionada = asignatura;
  }

  abrirAgregarAsignatura(): void {
    this.editandoAsignatura = false;
    this.formularioAsignatura = {
      id: 0,
      nombre: '',
      horasSemana: 0
    };
    this.mostrarFormularioAsignatura = true;
  }

  abrirEditarAsignatura(): void {
    if (!this.asignaturaSeleccionada) return;
    this.editandoAsignatura = true;
    this.formularioAsignatura = { ...this.asignaturaSeleccionada };
    this.mostrarFormularioAsignatura = true;
  }

  cerrarFormularioAsignatura(): void {
    this.mostrarFormularioAsignatura = false;
  }

  guardarAsignatura(): void {
    if (!this.formularioAsignatura.nombre || !this.formularioAsignatura.horasSemana) {
      alert('Completa los datos obligatorios.');
      return;
    }

    if (this.editandoAsignatura) {
      const indice = this.asignaturas.findIndex(a => a.id === this.formularioAsignatura.id);
      if (indice !== -1) {
        this.asignaturas[indice] = { ...this.formularioAsignatura };
      }
    } else {
      const nuevoId = this.asignaturas.length > 0 
        ? Math.max(...this.asignaturas.map(a => a.id)) + 1 
        : 1;
      this.asignaturas.push({
        ...this.formularioAsignatura,
        id: nuevoId
      });
    }

    this.guardarAsignaturas();
    this.cerrarFormularioAsignatura();
  }

  eliminarAsignatura(): void {
    if (!this.asignaturaSeleccionada) return;
    const confirmar = confirm(`¿Deseas eliminar ${this.asignaturaSeleccionada.nombre}?`);
    if (!confirmar) return;

    this.asignaturas = this.asignaturas.filter(a => a.id !== this.asignaturaSeleccionada!.id);
    this.guardarAsignaturas();
    this.asignaturaSeleccionada = null;
  }
}