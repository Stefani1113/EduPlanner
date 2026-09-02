import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfilService, MiPerfilDTO } from '../../services/perfil.service';
import { InstitutionSettingsService } from '../../services/institution-settings.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent implements OnInit {

  abierto = false;

  cargando = false;
  error: string | null = null;

  perfil: MiPerfilDTO | null = null;

  subiendoFoto = false;
  errorFoto: string | null = null;

  private readonly avatarPorDefecto = 'assets/img/profile.png';

  constructor(
    private perfilService: PerfilService,
    private institutionSettingsService: InstitutionSettingsService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
  
    this.cargarPerfil();
  }

  get fotoUrl(): string {
    return this.perfil?.photoUrl || this.avatarPorDefecto;
  }

  get nombreCompleto(): string {
    if (!this.perfil) {
      return '';
    }

    return [this.perfil.name, this.perfil.surnames]
      .filter(Boolean)
      .join(' ');
  }

  get rolLabel(): string {
    const rol = (this.perfil?.roleName || '').toLowerCase();

    if (rol.includes('admin')) {
      return 'Administrador';
    }

    if (rol.includes('doc')) {
      return 'Docente';
    }

    if (rol.includes('estud')) {
      return 'Estudiante';
    }

    if (rol.includes('direct')) {
      return 'Directivo';
    }

    return this.perfil?.roleName || '';
  }

  get esAdministrador(): boolean {
    return this.rolLabel === 'Administrador' || this.rolLabel === 'Directivo';
  }

  get esDocente(): boolean {
    return this.rolLabel === 'Docente';
  }

  get esEstudiante(): boolean {
    return this.rolLabel === 'Estudiante';
  }

  get especializacion(): string {
    return this.perfil?.qualificationsDesc
      || this.perfil?.professionalDegrees
      || 'No registrada';
  }

  get edad(): string {
    if (!this.perfil?.birthdate) {
      return 'No registrada';
    }

    const nacimiento = new Date(this.perfil.birthdate);

    if (isNaN(nacimiento.getTime())) {
      return 'No registrada';
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return `${edad} años`;
  }

  get acudiente(): string {
    return this.perfil?.guardianName || 'No registrado';
  }

  get institucionNombre(): string {
    return this.institutionSettingsService.current.info.nombreLargo
      || this.institutionSettingsService.current.info.nombreCorto
      || 'No asignada';
  }

  toggle(): void {
    this.abierto = !this.abierto;

    if (this.abierto && !this.perfil && !this.cargando) {
      this.cargarPerfil();
    }
  }

  cerrar(): void {
    this.abierto = false;
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent): void {
    if (!this.abierto) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.cerrar();
    }
  }

  @HostListener('document:keydown.escape')
  teclaEscape(): void {
    this.cerrar();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = null;

    this.perfilService.obtenerMiPerfil().subscribe({
      next: (respuesta) => {
        this.perfil = respuesta.data;
        this.cargando = false;
        console.log('[PERFIL] Perfil cargado exitosamente');
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'No se pudo cargar tu perfil.';
        console.error('[PERFIL] Error al consultar /users/me:', err);
      }
    });
  }

  seleccionarFoto(input: HTMLInputElement): void {
    input.click();
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files && input.files[0];

    if (!archivo) {
      return;
    }

    this.errorFoto = null;
    this.subiendoFoto = true;

    this.perfilService.actualizarFoto(archivo).subscribe({
      next: (respuesta) => {
        this.subiendoFoto = false;

        if (this.perfil) {
          this.perfil.photoUrl = respuesta.data;
        }

        this.perfilService.actualizarFotoEnCache(respuesta.data);

        input.value = '';
      },
      error: (err) => {
        this.subiendoFoto = false;
        this.errorFoto = 'No se pudo actualizar la foto.';
        input.value = '';
        console.error('[PERFIL] Error al subir la foto:', err);
      }
    });
  }
}