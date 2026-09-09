import { Injectable } from '@angular/core';

export interface SesionUsuarioBasica {
  nombre: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class SesionUsuarioService {

  private datos: SesionUsuarioBasica | null = null;

  establecerDesdeLogin(data: {
    name?: string;
    lastName?: string;
    role?: string;
  }): void {
    const nombre = [data.name, data.lastName]
      .filter(Boolean)
      .join(' ');

    this.datos = {
      nombre,
      role: data.role || ''
    };
  }

  get actual(): SesionUsuarioBasica | null {
    return this.datos;
  }

  limpiar(): void {
    this.datos = null;
  }
}
