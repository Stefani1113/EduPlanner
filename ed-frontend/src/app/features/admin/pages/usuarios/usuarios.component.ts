import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import {
  RegistroUsuarioModalComponent,
  UsuarioRegistrado,
  TipoRegistro
} from './registro-usuario-modal/registro-usuario-modal.component';
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
type Tab = 'listado' | 'importacion';

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
    ImportacionComponent
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit, OnDestroy {

  // Solo Listado e Importación; la pestaña "Registro" se eliminó:
  // el registro de usuarios ahora se hace únicamente desde "+ Registrar".
  tabs: { key: Tab; label: string }[] = [
    { key: 'listado', label: 'Listado' },
    { key: 'importacion', label: 'Importación' }
  ];
  activeTab: Tab = 'listado';

  roles: Rol[] = ['Administrador', 'Docente', 'Estudiante', 'Directivo'];
  grados: string[] = ['Todos los grados', '1° A Bachillerato', '2° A Bachillerato', '3° A Bachillerato'];

  rolSeleccionado: Rol = 'Docente';
  gradoSeleccionado: string = 'Todos los grados';
  mostrarFiltroRol = false;

  mostrarMenuRegistrar = false;
  tipoRegistro: TipoRegistro | null = null;
  guardandoUsuario = false;

  busqueda = '';

  usuarios: Usuario[] = [];
  cargando = false;
  errorCarga = '';

  constructor(
    private breadcrumbService: BreadcrumbService,
    private usuariosService: UsuariosService
  ) {}

  // Cierra los menús desplegables (filtro de rol / registrar) al hacer clic
  // fuera de ellos, o al abrir el modal de registro, para que no se queden
  // "pegados" flotando por encima del modal.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.mostrarFiltroRol && !this.mostrarMenuRegistrar) return;

    const target = event.target as HTMLElement;
    const clickDentroDeRoleBox = target.closest('.role-box');
    const clickDentroDeRegistrarBox = target.closest('.registrar-box');

    if (!clickDentroDeRoleBox) this.mostrarFiltroRol = false;
    if (!clickDentroDeRegistrarBox) this.mostrarMenuRegistrar = false;
  }

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


  cambiarTab(tab: Tab): void {
    this.activeTab = tab;
    this.actualizarBreadcrumb();
  }


  // Único punto de acción sobre un usuario en el listado: activar / inactivar.
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


  abrirRegistro(tipo: TipoRegistro): void {
    this.tipoRegistro = tipo;
    this.mostrarMenuRegistrar = false;
    this.mostrarFiltroRol = false; // evita que el filtro quede flotando sobre el modal
  }

  cerrarModal(): void {
    if (this.guardandoUsuario) return; // evita cerrar mientras hay una petición en curso
    this.tipoRegistro = null;
  }

  guardarUsuario(evento: UsuarioRegistrado): void {
    this.guardandoUsuario = true;

    switch (evento.tipo) {
      case 'Docente':
        this.usuariosService.registrarDocente(evento.payload).subscribe({
          next: (res) => this.onRegistroExitoso(res.message ?? 'Docente registrado correctamente.'),
          error: (err) => this.onRegistroFallido(err, 'No se pudo registrar el docente.')
        });
        break;

      case 'Estudiante':
        this.usuariosService.registrarEstudiante(evento.payload).subscribe({
          next: (res) => this.onRegistroExitoso(res.message ?? 'Estudiante registrado correctamente.'),
          error: (err) => this.onRegistroFallido(err, 'No se pudo registrar el estudiante.')
        });
        break;

      case 'Staff':
        this.usuariosService.registrarPersonal(evento.payload).subscribe({
          next: (res) => this.onRegistroExitoso(res.message ?? 'Usuario registrado correctamente.'),
          error: (err) => this.onRegistroFallido(err, 'No se pudo registrar el usuario.')
        });
        break;
    }
  }

  private onRegistroExitoso(mensaje: string): void {
    this.guardandoUsuario = false;
    this.tipoRegistro = null;
    this.cargarUsuarios();
    alert(mensaje);
  }

  private onRegistroFallido(err: any, mensajePorDefecto: string): void {
    this.guardandoUsuario = false;
    console.error(err);
    alert(err.error?.message ?? mensajePorDefecto);
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