import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import {
  RegistroUsuarioModalComponent,
  UsuarioRegistrado
} from './registro-usuario-modal/registro-usuario-modal.component';
import { RegistroUsuarioFormComponent } from './registro-usuario-form/registro-usuario-form.component';
import { CambiarRolModalComponent } from './cambiar-rol-modal/cambiar-rol-modal.component';
import { ImportacionComponent } from '../importacion/importacion.component';
import {
  UsuariosService,
  UserResponseDTO,
  ID_ROL_ADMINISTRADOR,
  ID_ROL_DOCENTE,
  ID_ROL_ESTUDIANTE,
  ID_ROL_DIRECTIVO
} from '../../services/usuarios.service';

type Rol = 'Administrador' | 'Docente' | 'Estudiante' | 'Directivo';
type Estado = 'Activo' | 'Inactivo';

const ROL_A_ID: Record<Rol, number> = {
  Administrador: ID_ROL_ADMINISTRADOR,
  Docente: ID_ROL_DOCENTE,
  Estudiante: ID_ROL_ESTUDIANTE,
  Directivo: ID_ROL_DIRECTIVO
};

const ID_A_ROL: Record<number, Rol> = {
  [ID_ROL_ADMINISTRADOR]: 'Administrador',
  [ID_ROL_DOCENTE]: 'Docente',
  [ID_ROL_ESTUDIANTE]: 'Estudiante',
  [ID_ROL_DIRECTIVO]: 'Directivo'
};

interface Usuario {
  id: number;
  idRole: number;
  foto: string | null;
  nombre: string;
  correo: string;
  telefono: string;
  rol: Rol;
  grado: string | null;
  estado: Estado;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RegistroUsuarioModalComponent,
    RegistroUsuarioFormComponent,
    CambiarRolModalComponent,
    ImportacionComponent
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit, OnDestroy {
 
  tabs: { key: 'listado' | 'registro' | 'importacion'; label: string }[] = [
    { key: 'listado', label: 'Listado' },
    { key: 'registro', label: 'Registro' },
    { key: 'importacion', label: 'Importación' }
  ];
  activeTab: 'listado' | 'registro' | 'importacion' = 'listado';

  roles: Rol[] = ['Administrador', 'Docente', 'Estudiante', 'Directivo'];
  grados: string[] = ['Todos los grados', '1° A Bachillerato', '2° A Bachillerato', '3° A Bachillerato'];

  rolSeleccionado: Rol = 'Docente';
  gradoSeleccionado: string = 'Todos los grados';
  mostrarFiltroRol = false;

  mostrarMenuRegistrar = false;
  tipoRegistro: 'Docente' | 'Estudiante' | null = null;

  // Modal de cambio de rol
  usuarioCambioRol: Usuario | null = null;

  busqueda = '';

  usuarios: Usuario[] = [];
  cargando = false;
  errorCarga = '';

  constructor(
    private breadcrumbService: BreadcrumbService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.setExtra(null);
  }


  private cargarUsuarios(): void {
    this.cargando = true;
    this.errorCarga = '';

    const idRole = ROL_A_ID[this.rolSeleccionado];

    this.usuariosService.listar(idRole).subscribe({
      next: (res) => {
        this.usuarios = res.data.map(u => this.mapearUsuario(u));
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.errorCarga = 'No se pudo cargar el listado de usuarios. Verifica tu conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  private mapearUsuario(dto: UserResponseDTO): Usuario {
    return {
      id: dto.idUser,
      idRole: dto.idRole,
      foto: dto.photoUrl,
      nombre: `${dto.name} ${dto.surnames}`.trim(),
      correo: dto.email,
      telefono: dto.phoneNumber,
      rol: ID_A_ROL[dto.idRole] ?? 'Docente',
      grado: null,
      estado: dto.status ? 'Activo' : 'Inactivo'
    };
  }


  get usuariosFiltrados(): Usuario[] {
    const term = this.busqueda.trim().toLowerCase();
    return this.usuarios.filter(u => !term || u.nombre.toLowerCase().includes(term));
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
    this.cargarUsuarios();
  }

  seleccionarGrado(grado: string): void {
    this.rolSeleccionado = 'Estudiante';
    this.gradoSeleccionado = grado;
    this.mostrarFiltroRol = false;
    this.actualizarBreadcrumb();
    this.cargarUsuarios();
  }


  cambiarTab(tab: 'listado' | 'registro' | 'importacion'): void {
    this.activeTab = tab;
    this.actualizarBreadcrumb();
  }


  toggleEstado(usuario: Usuario): void {
    const nuevoEstado = usuario.estado === 'Activo' ? false : true;

    this.usuariosService.actualizarEstado(usuario.id, nuevoEstado).subscribe({
      next: () => {
        usuario.estado = nuevoEstado ? 'Activo' : 'Inactivo';
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo actualizar el estado del usuario. Intenta de nuevo.');
      }
    });
  }


  abrirRegistro(tipo: 'Docente' | 'Estudiante'): void {
    this.tipoRegistro = tipo;
    this.mostrarMenuRegistrar = false;
  }

  cerrarModal(): void {
    this.tipoRegistro = null;
  }

  guardarUsuario(nuevo: UsuarioRegistrado): void {
    if (nuevo.tipo === 'Docente') {
      this.usuariosService.registrarDocente({
        name: nuevo.nombreCompleto.split(' ')[0] ?? nuevo.nombreCompleto,
        surnames: nuevo.nombreCompleto.split(' ').slice(1).join(' ') || '-',
        email: nuevo.correo,
        phoneNumber: nuevo.telefono,
        document: nuevo.cedula,
        documentType: 'CC',
        position: 'Docente',
        idRole: ID_ROL_DOCENTE
      }).subscribe({
        next: () => {
          this.tipoRegistro = null;
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message ?? 'No se pudo registrar el docente.');
        }
      });
    } else {
      this.usuariosService.registrarEstudiante({
        name: nuevo.nombres,
        surnames: nuevo.apellidos,
        email: nuevo.correo,
        phoneNumber: nuevo.telefono,
        document: nuevo.documento,
        documentType: 'TI',
        birthdate: nuevo.fechaNacimiento || null,
        guardian: { guardianName: '', guardianPhone: '' }
      }).subscribe({
        next: () => {
          this.tipoRegistro = null;
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message ?? 'No se pudo registrar el estudiante.');
        }
      });
    }
  }

  // Se llama cuando el formulario de la pestaña "Registro" registra un usuario con éxito
  onUsuarioRegistradoDesdeFormulario(): void {
    if (this.activeTab === 'listado') {
      this.cargarUsuarios();
    }
  }

  abrirCambioRol(usuario: Usuario): void {
    this.usuarioCambioRol = usuario;
  }

  cerrarCambioRol(): void {
    this.usuarioCambioRol = null;
  }

  onRolActualizado(): void {
    this.usuarioCambioRol = null;
    this.cargarUsuarios();
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
