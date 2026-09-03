import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { SidebarService } from '../../services/sidebar.service';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { PerfilService } from '../../services/perfil.service';
import { SesionUsuarioService } from '../../../auth/services/sesion-usuario.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, ProfileMenuComponent],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {


  breadcrumb: string[] = ['Mi institución'];

  extra: string | null = null;

  nombreUsuario = '';
  rolUsuario = 'Administrador';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private sidebarService: SidebarService,
    private perfilService: PerfilService,
    private sesionUsuarioService: SesionUsuarioService
  ) {}

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  ngOnInit(): void {

    this.updateBreadcrumb();
    this.cargarUsuario();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumb());

    this.breadcrumbService.extra$
      .subscribe(value => this.extra = value);
  }

  private cargarUsuario(): void {

    const sesion = this.sesionUsuarioService.actual;

    if (sesion) {
      if (sesion.nombre) {
        this.nombreUsuario = sesion.nombre;
      }
      if (sesion.role) {
        this.rolUsuario = this.formatearRol(sesion.role);
      }
      return;
    }

    this.perfilService.obtenerMiPerfil().subscribe({
      next: (respuesta) => {

        const usuario = respuesta.data;

        const nombreCompleto = [usuario.name, usuario.surnames]
          .filter(Boolean)
          .join(' ');

        if (nombreCompleto) {
          this.nombreUsuario = nombreCompleto;
        }

        if (usuario.roleName) {
          this.rolUsuario = this.formatearRol(usuario.roleName);
        }
      },
      error: () => {
      }
    });
  }

  private formatearRol(rol: string): string {

    const limpio = (rol || '').toLowerCase().trim();

    if (limpio.includes('admin')) {
      return 'Administrador';
    }

    if (limpio.includes('doc')) {
      return 'Docente';
    }

    if (limpio.includes('estud')) {
      return 'Estudiante';
    }

    if (limpio.includes('direct')) {
      return 'Directivo';
    }

    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }

  private updateBreadcrumb(): void {

    let route: ActivatedRoute | null = this.activatedRoute.root;


    let crumbs: string[] = ['Mi institución'];

    while (route) {

      if (
        route.snapshot.data &&
        route.snapshot.data['breadcrumb']
      ) {
        crumbs = route.snapshot.data['breadcrumb'];
      }

      route = route.firstChild;
    }

    this.breadcrumb = crumbs;
  }
}