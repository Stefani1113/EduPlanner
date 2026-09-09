import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  abierto = false;
  esAdministrador = false;
  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    private perfilService: PerfilService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.sidebarService.open$.subscribe(valor => this.abierto = valor)
    );

    this.subs.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => this.sidebarService.close())
    );

    this.subs.add(
      this.perfilService.obtenerMiPerfil().subscribe({
        next: respuesta => {
          const rol = (respuesta.data?.roleName || '').toLowerCase();
          this.esAdministrador = rol.includes('admin') && !rol.includes('direct');
        },
        error: () => {
          this.esAdministrador = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  cerrarMenu(): void {
    this.sidebarService.close();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}