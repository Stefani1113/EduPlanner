import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PerfilService } from '../../admin/services/perfil.service';
import { SesionUsuarioService } from './sesion-usuario.service';

export interface JwtResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = '/autenticacion/eduplanner/auth';

  private readonly TIEMPO_INACTIVIDAD_MS = 10 * 60 * 1000;
  private readonly MARGEN_RENOVACION_MS = 60 * 1000;
  private readonly MINIMO_ENTRE_RENOVACIONES_MS = 30 * 1000;

  private idTimeoutRenovacion: ReturnType<typeof setTimeout> | null = null;
  private ultimaActividad = 0;
  private ultimaRenovacion = 0;
  private renovando = false; 

  private eventosActividad = [
    'click',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart'
  ];

  private actividadHandler = () => {
    this.registrarActividad();
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private perfilService: PerfilService,
    private sesionUsuarioService: SesionUsuarioService
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, {
      email,
      password
    });
  }

  refrescarToken(): Observable<JwtResponse> {
    return this.http.get<JwtResponse>(`${this.api}/refresh`);
  }

  private registrarActividad(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    this.ultimaActividad = Date.now();

    sessionStorage.setItem(
      'ultimaActividad',
      this.ultimaActividad.toString()
    );

    const tiempoParaExpirar = this.msHastaExpiracion(token);

    if (
      tiempoParaExpirar !== null &&
      tiempoParaExpirar <= this.MARGEN_RENOVACION_MS
    ) {
      this.renovarToken();
    }
  }

  registrarActividadDesdeInterceptor(): void {
    this.registrarActividad();
  }

  iniciarRenovacionAutomatica(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    const actividadGuardada = sessionStorage.getItem(
      'ultimaActividad'
    );

    if (actividadGuardada) {
      this.ultimaActividad = Number(actividadGuardada);
    }

    if (!this.ultimaActividad) {
      this.registrarActividad();
    }

    this.activarDetectorActividad();
    this.programarRenovacion(token);
  }

  private activarDetectorActividad(): void {
    this.desactivarDetectorActividad();

    this.eventosActividad.forEach(evento => {
      window.addEventListener(
        evento,
        this.actividadHandler,
        {
          passive: true
        }
      );
    });
  }

  private desactivarDetectorActividad(): void {
    this.eventosActividad.forEach(evento => {
      window.removeEventListener(
        evento,
        this.actividadHandler
      );
    });
  }

  private usuarioActivo(): boolean {
    if (!this.ultimaActividad) {
      return false;
    }

    const tiempoSinActividad =
      Date.now() - this.ultimaActividad;

    return tiempoSinActividad <
      this.TIEMPO_INACTIVIDAD_MS;
  }

  private programarRenovacion(token: string): void {
    this.detenerTimeoutRenovacion();

    const msHastaExpirar =
      this.msHastaExpiracion(token);

    if (msHastaExpirar === null) {
      return;
    }

    if (!this.usuarioActivo()) {
      console.log(
        '[AUTH] Usuario inactivo. No se renovará el token.'
      );
      return;
    }

    const espera = Math.max(
      msHastaExpirar -
        this.MARGEN_RENOVACION_MS,
      1000
    );

    this.idTimeoutRenovacion = setTimeout(() => {

      if (!this.usuarioActivo()) {
        console.log(
          '[AUTH] Sesión detenida por inactividad.'
        );

        this.detenerTimeoutRenovacion();
        return;
      }

      this.renovarToken();

    }, espera);
  }

  private renovarToken(): void {
    if (this.renovando) {
      return;
    }

    if (!this.usuarioActivo()) {
      console.log(
        '[AUTH] No se renueva el token porque el usuario está inactivo.'
      );

      this.detenerTimeoutRenovacion();
      return;
    }

    if (
      this.ultimaRenovacion > 0 &&
      Date.now() - this.ultimaRenovacion <
        this.MINIMO_ENTRE_RENOVACIONES_MS
    ) {
      return;
    }

    this.renovando = true;

    console.log('[AUTH] Renovando JWT...');

    this.refrescarToken().subscribe({
      next: (respuesta) => {
        this.renovando = false;

        if (!respuesta?.token) {
          console.error(
            '[AUTH] El backend no devolvió un token.'
          );

          this.cerrarSesionPorExpiracion();
          return;
        }

        localStorage.setItem(
          'token',
          respuesta.token
        );

        this.ultimaRenovacion = Date.now();

        console.log(
          '[AUTH] JWT renovado correctamente.'
        );

        this.programarRenovacion(
          respuesta.token
        );
      },

      error: (error) => {
        this.renovando = false;

        console.error(
          '[AUTH] Error renovando JWT:',
          error
        );

        this.cerrarSesionPorExpiracion();
      }
    });
  }

  detenerRenovacionAutomatica(): void {
    this.detenerTimeoutRenovacion();
    this.desactivarDetectorActividad();

    this.ultimaActividad = 0;
    this.ultimaRenovacion = 0;
    this.renovando = false;

    sessionStorage.removeItem(
      'ultimaActividad'
    );
  }

  private detenerTimeoutRenovacion(): void {
    if (this.idTimeoutRenovacion !== null) {
      clearTimeout(
        this.idTimeoutRenovacion
      );

      this.idTimeoutRenovacion = null;
    }
  }

  logout(): void {
    this.detenerRenovacionAutomatica();

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('ultimaActividad');

    this.perfilService.limpiarCache();
    this.sesionUsuarioService.limpiar();
  }

  private cerrarSesionPorExpiracion(): void {
    this.logout();

    this.router.navigate(
      ['/auth'],
      {
        queryParams: {
          sesionExpirada: true
        }
      }
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.api}/forgot-password`,
      {
        email
      }
    );
  }

  resetPassword(
    token: string,
    newPassword: string
  ): Observable<any> {
    return this.http.put(
      `${this.api}/reset-password`,
      {
        token,
        newPassword
      }
    );
  }

  private msHastaExpiracion(
    token: string
  ): number | null {
    try {
      const partes = token.split('.');

      if (partes.length !== 3) {
        return null;
      }

      const payloadBase64 = partes[1];

      const payloadJson = atob(
        payloadBase64
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      );

      const payload = JSON.parse(
        payloadJson
      );

      if (!payload?.exp) {
        return null;
      }

      return (
        payload.exp * 1000 -
        Date.now()
      );

    } catch (error) {
      console.error(
        '[AUTH] No se pudo leer el JWT:',
        error
      );

      return null;
    }
  }

  activarCuenta(
  token: string,
  newPassword: string
): Observable<any> {

  return this.http.put(
    `${this.api}/activation-account`,
    {
      token,
      newPassword
    }
  );
}
}