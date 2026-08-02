import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { RegistroUsuarioModalComponent, UsuarioRegistrado } from './registro-usuario-modal/registro-usuario-modal.component';

type Rol = 'Docente' | 'Estudiante';
type Estado = 'Activo' | 'Inactivo';

interface Usuario {
  id: string;
  foto: string | null;
  nombre: string;
  correo: string;
  rol: Rol;
  grado: string | null;
  estado: Estado;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RegistroUsuarioModalComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit, OnDestroy {

  tabs: { key: 'listado' | 'importacion'; label: string }[] = [
    { key: 'listado', label: 'Listado' },
    { key: 'importacion', label: 'Importación' }
  ];
  activeTab: 'listado' | 'importacion' = 'listado';

  roles: Rol[] = ['Docente', 'Estudiante'];
  grados: string[] = ['Todos los grados', '1° A Bachillerato', '2° A Bachillerato', '3° A Bachillerato'];

  rolSeleccionado: Rol = 'Docente';
  gradoSeleccionado: string = 'Todos los grados';
  mostrarFiltroRol = false;

  mostrarMenuRegistrar = false;
  tipoRegistro: Rol | null = null;

  busqueda = '';

  usuarios: Usuario[] = [
    { id: '123', foto: null, nombre: 'Estefania Gómez', correo: 'este@gmail.com', rol: 'Docente', grado: null, estado: 'Activo' },
    { id: '124', foto: null, nombre: 'María José Rojas', correo: 'mojo@gmail.com', rol: 'Docente', grado: null, estado: 'Activo' },
    { id: '125', foto: null, nombre: 'Estefania Gómez', correo: 'este@gmail.com', rol: 'Docente', grado: null, estado: 'Activo' },
    { id: '126', foto: null, nombre: 'Estefania Gómez', correo: 'este@gmail.com', rol: 'Docente', grado: null, estado: 'Inactivo' },
    { id: '201', foto: null, nombre: 'Ana María Pérez', correo: 'ana.perez@institucion.edu', rol: 'Estudiante', grado: '1° A Bachillerato', estado: 'Activo' },
    { id: '202', foto: null, nombre: 'Juan David Ruiz', correo: 'juan.ruiz@institucion.edu', rol: 'Estudiante', grado: '2° A Bachillerato', estado: 'Activo' },
    { id: '203', foto: null, nombre: 'Laura Camila Gil', correo: 'laura.gil@institucion.edu', rol: 'Estudiante', grado: '3° A Bachillerato', estado: 'Inactivo' }
  ];

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.actualizarBreadcrumb();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setExtra(null);
  }

  get usuariosFiltrados(): Usuario[] {
    const term = this.busqueda.trim().toLowerCase();

    return this.usuarios
      .filter(u => u.rol === this.rolSeleccionado)
      .filter(u =>
        this.rolSeleccionado !== 'Estudiante' ||
        this.gradoSeleccionado === 'Todos los grados' ||
        u.grado === this.gradoSeleccionado
      )
      .filter(u => !term || u.nombre.toLowerCase().includes(term));
  }

  get totalRol(): number {
    return this.usuariosFiltrados.length;
  }

  get activosRol(): number {
    return this.usuariosFiltrados.filter(u => u.estado === 'Activo').length;
  }

  get inactivosRol(): number {
    return this.usuariosFiltrados.filter(u => u.estado === 'Inactivo').length;
  }

  seleccionarRol(rol: Rol): void {
    this.rolSeleccionado = rol;
    this.gradoSeleccionado = 'Todos los grados';
    this.mostrarFiltroRol = false;
    this.actualizarBreadcrumb();
  }

  seleccionarGrado(grado: string): void {
    this.rolSeleccionado = 'Estudiante';
    this.gradoSeleccionado = grado;
    this.mostrarFiltroRol = false;
    this.actualizarBreadcrumb();
  }

  cambiarTab(tab: 'listado' | 'importacion'): void {
    this.activeTab = tab;
    this.actualizarBreadcrumb();
  }

  toggleEstado(usuario: Usuario): void {
    usuario.estado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
  }

  abrirRegistro(tipo: Rol): void {
    this.tipoRegistro = tipo;
    this.mostrarMenuRegistrar = false;
  }

  cerrarModal(): void {
    this.tipoRegistro = null;
  }

  guardarUsuario(nuevo: UsuarioRegistrado): void {
    const usuario: Usuario = {
      id: this.generarId(),
      foto: nuevo.foto,
      nombre: nuevo.nombre,
      correo: nuevo.correo,
      rol: nuevo.rol,
      grado: nuevo.grado,
      estado: 'Activo'
    };

    this.usuarios = [usuario, ...this.usuarios];
    this.tipoRegistro = null;
  }

  private generarId(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  private actualizarBreadcrumb(): void {
    const tabLabel = this.tabs.find(t => t.key === this.activeTab)?.label ?? '';
    const partes = [tabLabel, this.rolSeleccionado];

    if (this.rolSeleccionado === 'Estudiante' && this.gradoSeleccionado !== 'Todos los grados') {
      partes.push(this.gradoSeleccionado);
    }

    this.breadcrumbService.setExtra(partes.join(' · '));
  }
}