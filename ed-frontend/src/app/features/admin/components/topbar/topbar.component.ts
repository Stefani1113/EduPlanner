import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbService } from '../../services/breadcrumb.service';

interface UsuarioSesion {
  name?: string;
  lastName?: string;
  role?: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {

  breadcrumb: string[] = ['Panel Control'];
  extra: string | null = null;

  nombreUsuario = '';
  rolUsuario = 'Administrador';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.updateBreadcrumb();
    this.cargarUsuario();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumb());

    this.breadcrumbService.extra$.subscribe(value => this.extra = value);
  }

  private cargarUsuario(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) return;

    try {
      const usuario: UsuarioSesion = JSON.parse(raw);
      const nombreCompleto = [usuario.name, usuario.lastName].filter(Boolean).join(' ');

      if (nombreCompleto) {
        this.nombreUsuario = nombreCompleto;
      }
      if (usuario.role) {
        this.rolUsuario = this.formatearRol(usuario.role);
      }
    } catch {
    }
  }

  private formatearRol(rol: string): string {
    const limpio = rol.toLowerCase().trim();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }

  private updateBreadcrumb(): void {
    let route: ActivatedRoute | null = this.activatedRoute.root;
    let crumbs: string[] = ['Panel Control'];

    while (route) {
      if (route.snapshot.data && route.snapshot.data['breadcrumb']) {
        crumbs = route.snapshot.data['breadcrumb'];
      }
      route = route.firstChild;
    }

    this.breadcrumb = crumbs;
  }
} 