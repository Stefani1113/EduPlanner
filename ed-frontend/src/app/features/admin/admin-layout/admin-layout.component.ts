import { Component, OnDestroy, OnInit } from '@angular/core';
import { PerfilService } from '../services/perfil.service';
import { InstitutionSettingsService } from '../services/institution-settings.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  esAdministrador = false;
  perfilCargado = false;
  modoTema: 'dark' | 'light' | 'custom' = 'dark';

  constructor(
    private perfilService: PerfilService,
    private institutionSettingsService: InstitutionSettingsService
  ) {}

  ngOnInit(): void {
    this.institutionSettingsService.activarTemaSesion();
    this.modoTema = this.institutionSettingsService.currentMode;

    this.perfilService.obtenerMiPerfil().subscribe({
      next: respuesta => {
        const rol = (respuesta.data?.roleName || '').toLowerCase();
        this.esAdministrador = rol.includes('admin') && !rol.includes('direct');
        this.perfilCargado = true;
      },
      error: () => {
        this.esAdministrador = false;
        this.perfilCargado = true;
      }
    });
  }

  cambiarTema(modo: 'dark' | 'light' | 'custom'): void {
    this.institutionSettingsService.setMode(modo);
    this.modoTema = modo;
  }

  ngOnDestroy(): void {
    this.institutionSettingsService.detenerSincronizacion();
    this.institutionSettingsService.restaurarTemaPublico();
  }
}