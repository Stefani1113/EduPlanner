import { Component, OnDestroy, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import {
  RegistroUsuarioModalComponent,
  UsuarioRegistrado,
  TipoRegistro
} from './registro-usuario-modal/registro-usuario-modal.component';
import {
  EditarUsuarioModalComponent,
  UsuarioEditado,
  TipoEdicion
} from './editar-usuario-modal/editar-usuario-modal.component';
import { ImportacionComponent } from '../importacion/importacion.component';
import {
  UsuariosService,
  UserResponseDTO,
  ID_ROL_ADMINISTRADOR,
  ID_ROL_DOCENTE,
  ID_ROL_ESTUDIANTE,
  ID_ROL_DIRECTIVO,
  TeachingRequestDTO,
  UpdateStudentDTO,
  UpdateStaffDTO
} from '../../services/usuarios.service';
import { ModalService } from '../../../../core/services/modal.service';

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
  detalle: UserResponseDTO;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RegistroUsuarioModalComponent,
    EditarUsuarioModalComponent,
    ImportacionComponent
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit, OnDestroy {

  @ViewChild(RegistroUsuarioModalComponent) modalRegistro!: RegistroUsuarioModalComponent;

  tabs: { key: Tab; label: string }[] = [
    { key: 'listado', label: 'Listado' },
    { key: 'importacion', label: 'Importación' }
  ];
  activeTab: Tab = 'listado';

  roles: Rol[] = ['Administrador', 'Docente', 'Estudiante', 'Directivo'];
  grados: string[] = ['Todos los grados', '1° A Bachillerato', '2° A Bachillerato', '3° A Bachillerato'];

  rolSeleccionado: Rol = 'Docente';
  gradoSeleccionado = 'Todos los grados';
  mostrarFiltroRol = false;

  mostrarMenuRegistrar = false;
  tipoRegistro: TipoRegistro | null = null;
  guardandoUsuario = false;

  usuarioEnEdicion: UserResponseDTO | null = null;
  tipoEdicion: TipoEdicion | null = null;
  guardandoEdicion = false;

  busqueda = '';

  usuarios: Usuario[] = [];
  cargando = false;
  exportando = false;
  errorCarga = '';

  constructor(
    private breadcrumbService: BreadcrumbService,
    private usuariosService: UsuariosService,
    private modalService: ModalService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.mostrarFiltroRol && !this.mostrarMenuRegistrar) return;

    const target = event.target as HTMLElement;
    if (!target.closest('.role-box')) this.mostrarFiltroRol = false;
    if (!target.closest('.registrar-box')) this.mostrarMenuRegistrar = false;
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

    this.usuariosService.listar(ROL_A_ID[this.rolSeleccionado]).subscribe({
      next: res => {
        this.usuarios = (res.data ?? []).map(u => this.mapearUsuario(u));
        this.cargando = false;
      },
      error: err => {
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
      estado: dto.status ? 'Activo' : 'Inactivo',
      detalle: dto
    };
  }

  get usuariosFiltrados(): Usuario[] {
    const term = this.busqueda.trim().toLowerCase();
    return this.usuarios.filter(u =>
      !term ||
      u.nombre.toLowerCase().includes(term) ||
      u.correo.toLowerCase().includes(term) ||
      String(u.id).includes(term)
    );
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

 toggleEstado(usuario: Usuario): void {
  const nuevoEstado = usuario.estado !== 'Activo';

  this.usuariosService.actualizarEstado(usuario.id, nuevoEstado).subscribe({
    next: () => {
      usuario.estado = nuevoEstado ? 'Activo' : 'Inactivo';
      usuario.detalle.status = nuevoEstado;

      if (nuevoEstado) {
        this.modalService.success('El usuario fue activado exitosamente.');
      } else {
        this.modalService.success('El usuario fue desactivado exitosamente.');
      }
    },
    error: err => {
      console.error(err);
      this.modalService.error(
        err.error?.message ??
        'No se pudo actualizar el estado del usuario. Intenta de nuevo.'
      );
    }
  });
}

  abrirRegistro(tipo: TipoRegistro): void {
    this.tipoRegistro = tipo;
    this.mostrarMenuRegistrar = false;
    this.mostrarFiltroRol = false;
  }

  cerrarModal(): void {
    if (!this.guardandoUsuario) this.tipoRegistro = null;
  }

  guardarUsuario(evento: UsuarioRegistrado): void {
    this.guardandoUsuario = true;

    switch (evento.tipo) {
      case 'Docente':
        this.usuariosService.registrarDocente(evento.payload).subscribe({
          next: res => this.onRegistroExitoso(res.message ?? 'Docente registrado correctamente. Se envió un correo de activación.'),
          error: err => this.onRegistroFallido(err, 'No se pudo registrar el docente.')
        });
        break;
      case 'Estudiante':
        this.usuariosService.registrarEstudiante(evento.payload).subscribe({
          next: res => this.onRegistroExitoso(res.message ?? 'Estudiante registrado correctamente. Se envió un correo de activación.'),
          error: err => this.onRegistroFallido(err, 'No se pudo registrar el estudiante.')
        });
        break;
      case 'Staff':
        this.usuariosService.registrarPersonal(evento.payload).subscribe({
          next: res => this.onRegistroExitoso(res.message ?? 'Usuario registrado correctamente. Se envió un correo de activación.'),
          error: err => this.onRegistroFallido(err, 'No se pudo registrar el usuario.')
        });
        break;
    }
  }

  private onRegistroExitoso(mensaje: string): void {
    this.guardandoUsuario = false;
    this.tipoRegistro = null;
    this.cargarUsuarios();
    this.modalService.success(mensaje);
  }

  private onRegistroFallido(err: any, mensajePorDefecto: string): void {
    this.guardandoUsuario = false;
    console.error(err);
    const mensajeError = err.error?.message ?? mensajePorDefecto;
    if (this.modalRegistro) this.modalRegistro.onErrorGuardado(mensajeError);
    else this.modalService.error(mensajeError);
  }

  editar(usuario: Usuario): void {
    this.mostrarFiltroRol = false;
    this.mostrarMenuRegistrar = false;
    this.guardandoEdicion = false;

    this.usuariosService.obtenerPorId(usuario.id).subscribe({
      next: res => {
        this.usuarioEnEdicion = res.data;
        this.tipoEdicion = this.obtenerTipoEdicion(res.data.idRole);
      },
      error: err => {
        console.error(err);
        this.modalService.error(err.error?.message ?? 'No se pudieron cargar los datos del usuario.');
      }
    });
  }

  cerrarEdicion(): void {
    if (this.guardandoEdicion) return;
    this.usuarioEnEdicion = null;
    this.tipoEdicion = null;
  }

  guardarEdicion(evento: UsuarioEditado): void {
    this.guardandoEdicion = true;

    if (evento.tipo === 'Docente') {
      this.usuariosService.actualizarDocente(evento.id, evento.payload as TeachingRequestDTO).subscribe({
        next: res => this.finalizarEdicion(res.message ?? 'Docente actualizado correctamente.'),
        error: err => this.errorEdicion(err)
      });
      return;
    }

    if (evento.tipo === 'Estudiante') {
      this.usuariosService.actualizarEstudiante(evento.id, evento.payload as UpdateStudentDTO).subscribe({
        next: res => this.finalizarEdicion(res.message ?? 'Estudiante actualizado correctamente.'),
        error: err => this.errorEdicion(err)
      });
      return;
    }

    this.usuariosService.actualizarStaff(evento.id, evento.payload as UpdateStaffDTO).subscribe({
      next: res => this.finalizarEdicion(res.message ?? 'Usuario actualizado correctamente.'),
      error: err => this.errorEdicion(err)
    });
  }

  private finalizarEdicion(mensaje: string): void {
    this.guardandoEdicion = false;
    this.usuarioEnEdicion = null;
    this.tipoEdicion = null;
    this.cargarUsuarios();
    this.modalService.success(mensaje);
  }

  private errorEdicion(err: any): void {
    this.guardandoEdicion = false;
    console.error(err);
    this.modalService.error(err.error?.message ?? 'No se pudieron guardar los cambios del usuario.');
  }

  private obtenerTipoEdicion(idRole: number): TipoEdicion {
    return idRole === ID_ROL_DOCENTE
      ? 'Docente'
      : idRole === ID_ROL_ESTUDIANTE
        ? 'Estudiante'
        : 'Staff';
  }

  /**
   * Exporta exactamente el rol seleccionado. No depende del texto de búsqueda:
   * si el filtro dice Docente, el CSV contiene todos los docentes cargados.
   */
  exportarCSV(): void {
    if (this.exportando || this.cargando || this.usuarios.length === 0) return;

    this.exportando = true;

    try {
      const headers = [
        'ID', 'Nombre', 'Apellidos', 'Correo', 'Teléfono', 'Documento',
        'Tipo documento', 'Lugar expedición', 'Género', 'Fecha nacimiento',
        'Dirección', 'Tipo sangre', 'Discapacidades', 'Estrato',
        'Tipo población', 'Régimen salud', 'EPS', 'Cargo',
        'Títulos profesionales', 'Descripción cualificaciones', 'Rol', 'Estado'
      ];

      const rows = this.usuarios.map(({ detalle: u }) => [
        u.idUser, u.name, u.surnames, u.email, u.phoneNumber, u.document,
        u.documentType, u.documentIssuePlace, u.gender, u.birthdate,
        u.address, u.bloodType, u.disabilities, u.stratum,
        u.populationType, u.healthRegime, u.eps, u.position,
        u.professionalDegrees, u.qualificationsDesc, u.roleName,
        u.status ? 'Activo' : 'Inactivo'
      ]);

      const csv = '\uFEFF' + [headers, ...rows]
        .map(row => row.map(value => this.escaparCSV(value)).join(','))
        .join('\r\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios_${this.normalizarNombreArchivo(this.rolSeleccionado)}_${this.fechaArchivo()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exportando = false;
    }
  }

  private escaparCSV(value: unknown): string {
    if (value === null || value === undefined) return '';
    const texto = String(value);
    return /[",\r\n]/.test(texto)
      ? `"${texto.replace(/"/g, '""')}"`
      : texto;
  }

  private normalizarNombreArchivo(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private fechaArchivo(): string {
    return new Date().toISOString().slice(0, 10);
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