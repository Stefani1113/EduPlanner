import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {

  esAdministrador = false;

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {
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
}