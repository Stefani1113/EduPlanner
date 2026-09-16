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

  constructor(
    private perfilService: PerfilService,
    private institutionSettingsService: InstitutionSettingsService
  ) {}

  ngOnInit(): void {
 
    this.institutionSettingsService.activarTemaSesion();

    this.perfilService.obtenerMiPerfil().subscribe({
      next: respuesta => {
        const rol = (respuesta.data?.roleName || '').toLowerCase();
        this.esAdministrador = rol.includes('admin') && !rol.includes('direct');
      },
      error: () => {
        this.esAdministrador = false;
      }
    });
  }

  ngOnDestroy(): void {

    this.institutionSettingsService.restaurarTemaPorDefecto();
  }
}