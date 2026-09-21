import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface InstitutionPalette {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
}

export interface CarouselImage {
  url: string;
}

export interface PilarInstitucional {
  titulo: string;
  descripcion: string;
}

export interface InstitutionInfo {
  logoUrl: string;
  nombreCorto: string;
  nombreLargo: string;
  descripcion: string;
  carousel: CarouselImage[];
  heroBadge: string;
  mision: string;
  vision: string;
  contactoDireccion: string;
  reglamentoUrl: string;
  construccionLegalUrl: string;
  pilares: PilarInstitucional[];
  comunidadImagenUrl: string;
  comunidadTitulo: string;
  espaciosImagenUrl: string;
  espaciosTitulo: string;
}

export interface InstitutionSettings {
  palette: InstitutionPalette;
  info: InstitutionInfo;
}

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
}

interface ConfigurationResponse {
  shortName: string;
  longName: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  cardBackground: string;
  secondaryBackground: string;
  generalBackground: string;
  institutionalWhite: string;
  updatedAt: string;
}

interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export const INFO_TEXT_LIMITS = {
  nombreCorto: 40,
  nombreLargo: 70,
  descripcion: 200,
  heroBadge: 40,
  mision: 260,
  vision: 260,
  contactoDireccion: 90,
  pilarTitulo: 30,
  pilarDescripcion: 130,
  comunidadTitulo: 45,
  espaciosTitulo: 45
};


const LEGACY_STORAGE_KEYS = [
  'eduplanner.institution-settings',
  'eduplanner.institution-settings.v2',
  'asignaturas',
  'docentes'
];

const STORAGE_KEY = 'eduplanner.institution-settings.v3';
const THEME_MODE_KEY = 'eduplanner.theme-mode';
const CUSTOM_PALETTE_KEY = 'eduplanner.custom-palette';
const CUSTOM_BRAND_COLORS_KEY = 'eduplanner.custom-brand-colors';
const SYNC_INTERVAL_MS = 15000;

// Oscuro y Claro son temas FIJOS: iguales para todo el mundo, sin importar
// lo que el administrador edite en la pestaña "Personalizado". Así se evita
// que al cambiar de tema queden colores mezclados de otro tema.
const DEFAULT_PALETTE: InstitutionPalette = {
  primary: '#0d790b',
  secondary: '#4ed10b',
  accent: '#b9e5b9',
  dark: '#0d0d0d',
  light: '#ffffff',
  surface: '#161616',
  surfaceAlt: '#1b1c1c',
  text: '#ffffff',
  muted: '#a5a5a5',
  border: '#3a3a3a'
};

const LIGHT_PALETTE: InstitutionPalette = {
  primary: '#0d790b',
  secondary: '#2f9e0a',
  accent: '#eaf7ea',
  dark: '#f5f7f4',
  light: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#eef1ec',
  text: '#14181f',
  muted: '#6b7268',
  border: '#d8ddd4'
};

const DEFAULT_CUSTOM_PALETTE: InstitutionPalette = { ...DEFAULT_PALETTE };

const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: DEFAULT_PALETTE.primary,
  secondary: DEFAULT_PALETTE.secondary,
  accent: DEFAULT_PALETTE.accent,
  surface: DEFAULT_PALETTE.surface,
  surfaceAlt: DEFAULT_PALETTE.surfaceAlt
};

export type ThemeMode = 'dark' | 'light' | 'custom';

const DEFAULT_INFO: InstitutionInfo = {
  logoUrl: '',
  nombreCorto: 'Nuevo Horizonte',
  nombreLargo: 'Institución Educativa Nuevo Horizonte',

  descripcion:
    'Liderando el futuro educativo a través de una formación integral, innovadora y humana.',

  carousel: [
    { url: 'assets/img/institucion-edificio.png' },
    { url: 'assets/img/estudiantes-institucion.png' }
  ],

  heroBadge: '✦ Excelencia académica',

  mision:
    'Formar líderes integrales con capacidad crítica, ética y creativa, capaces de transformar la sociedad mediante el conocimiento y la innovación.',

  vision:
    'Ser una institución reconocida por su innovación educativa, compromiso social y capacidad de transformar positivamente su entorno.',

  contactoDireccion:
    'Calle 10 # 8-25 · Barcelona, Quindío',

  reglamentoUrl: '',

  construccionLegalUrl: '',

  pilares: [
    {
      titulo: 'Integralidad',
      descripcion: 'Desarrollamos competencias académicas, sociales y personales.'
    },
    {
      titulo: 'Innovación',
      descripcion: 'Integramos tecnología y nuevas metodologías al aprendizaje.'
    },
    {
      titulo: 'Comunidad',
      descripcion: 'Construimos una comunidad educativa basada en respeto y colaboración.'
    }
  ],

  comunidadImagenUrl: 'assets/img/estudiantes-institucion.png',
  comunidadTitulo: 'Comunidad educativa',

  espaciosImagenUrl: 'assets/img/carrucel-libreria.png',
  espaciosTitulo: 'Espacios educativos'
};

@Injectable({
  providedIn: 'root'
})
export class InstitutionSettingsService {

  private readonly apiUrl = '/configuracion-institucional/configuration';

  // Colores de marca del tema Personalizado, compartidos por backend
  // (solo se aplican cuando el modo activo es "custom").
  private coloresMarcaPersonalizado: BrandColors = this.loadCustomBrandColors();

  private settingsSubject =
    new BehaviorSubject<InstitutionSettings>(
      this.load()
    );

  readonly settings$ =
    this.settingsSubject.asObservable();

  private modeSubject =
    new BehaviorSubject<ThemeMode>(this.loadMode());

  readonly mode$ =
    this.modeSubject.asObservable();

  private syncTimer?: ReturnType<typeof setInterval>;

  private storageListener = (event: StorageEvent): void => {

    if (event.key === CUSTOM_BRAND_COLORS_KEY && event.newValue) {
      try {
        this.coloresMarcaPersonalizado = JSON.parse(event.newValue) as BrandColors;
        if (this.currentMode === 'custom') {
          this.applyModePalette('custom');
        }
      } catch {
        // Ignorar valor inválido.
      }
    }

    if (event.key === CUSTOM_PALETTE_KEY && this.currentMode === 'custom') {
      this.applyModePalette('custom');
    }

    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as InstitutionSettings;
        if (parsed?.info) {
          const next: InstitutionSettings = {
            palette: this.settingsSubject.value.palette,
            info: this.sanitizeInfo(parsed.info)
          };
          this.settingsSubject.next(next);
        }
      } catch {
        // Ignorar valores locales inválidos.
      }
    }

    if (event.key === THEME_MODE_KEY) {
      const mode = event.newValue as ThemeMode | null;
      if (mode === 'dark' || mode === 'light' || mode === 'custom') {
        this.modeSubject.next(mode);
        this.applyModePalette(mode);
      }
    }
  };

  constructor(private http: HttpClient) {
    window.addEventListener('storage', this.storageListener);
  }


  get current(): InstitutionSettings {
    return this.settingsSubject.value;
  }

  get currentMode(): ThemeMode {
    return this.modeSubject.value;
  }


  /**
   * Trae del backend la información institucional (nombre, descripción,
   * logo) y los 5 colores de marca del tema Personalizado.
   *
   * Oscuro y Claro NUNCA se tocan aquí: son fijos y no dependen del
   * backend, así que no se pueden mezclar con nada más.
   */
  cargarDesdeBackend(): void {
    this.http.get<HttpGlobalResponse<ConfigurationResponse>>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe(respuesta => {

      const config = respuesta?.data;

      const info: InstitutionInfo = {
        ...this.settingsSubject.value.info,
        nombreCorto: config?.shortName || this.settingsSubject.value.info.nombreCorto,
        nombreLargo: config?.longName || this.settingsSubject.value.info.nombreLargo,
        descripcion: config?.description || this.settingsSubject.value.info.descripcion,
        logoUrl: config ? (config.logoUrl || '') : this.settingsSubject.value.info.logoUrl
      };

      if (config) {
        this.coloresMarcaPersonalizado = {
          primary: config.primaryColor || this.coloresMarcaPersonalizado.primary,
          secondary: config.secondaryColor || this.coloresMarcaPersonalizado.secondary,
          accent: config.accentColor || this.coloresMarcaPersonalizado.accent,
          surface: config.cardBackground || this.coloresMarcaPersonalizado.surface,
          surfaceAlt: config.secondaryBackground || this.coloresMarcaPersonalizado.surfaceAlt
        };
        this.guardarColoresMarcaPersonalizado(this.coloresMarcaPersonalizado);
      }

      const palette = this.getModePalette(this.currentMode);
      const next: InstitutionSettings = { palette, info: this.sanitizeInfo(info) };

      this.settingsSubject.next(next);
      this.saveLocal(next);
      this.applyPalette(palette);
    });
  }


  setMode(mode: ThemeMode): void {
    this.modeSubject.next(mode);

    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error('No se pudo guardar la preferencia de tema:', error);
    }

    this.applyModePalette(mode);
  }

  private applyModePalette(mode: ThemeMode): void {
    const palette = this.getModePalette(mode);
    const next = {
      ...this.settingsSubject.value,
      palette
    };

    this.settingsSubject.next(next);
    this.saveLocal(next);
    this.applyPalette(palette);
  }

  /**
   * Oscuro y Claro: siempre devuelven el preset fijo, tal cual, sin mezcla.
   * Personalizado: devuelve la paleta guardada localmente, con los 5
   * colores de marca (los que sí llegan del backend) puestos encima.
   */
  private getModePalette(mode: ThemeMode): InstitutionPalette {

    if (mode === 'light') {
      return { ...LIGHT_PALETTE };
    }

    if (mode === 'dark') {
      return { ...DEFAULT_PALETTE };
    }

    const base = this.loadCustomPalette() || DEFAULT_CUSTOM_PALETTE;

    return {
      ...base,
      primary: this.coloresMarcaPersonalizado.primary,
      secondary: this.coloresMarcaPersonalizado.secondary,
      accent: this.coloresMarcaPersonalizado.accent,
      surface: this.coloresMarcaPersonalizado.surface,
      surfaceAlt: this.coloresMarcaPersonalizado.surfaceAlt
    };
  }


  private loadMode(): ThemeMode {
    try {
      const mode = localStorage.getItem(THEME_MODE_KEY);
      return mode === 'light' || mode === 'custom' ? mode : 'dark';
    } catch (error) {
      return 'dark';
    }
  }


  activarTemaSesion(): void {
    this.applyModePalette(this.currentMode);
    this.cargarDesdeBackend();

    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => this.cargarDesdeBackend(), SYNC_INTERVAL_MS);
    }
  }

  detenerSincronizacion(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  restaurarTemaPublico(): void {
    this.applyPalette(DEFAULT_PALETTE);
  }


  /**
   * Solo tiene efecto sobre colores cuando el modo activo es "custom"
   * (pestaña Personalizado). Con Oscuro o Claro seleccionados, la UI no
   * deja editar los colores, así que aquí solo se actualiza el texto/logo.
   */
  updateSettings(
    palette: InstitutionPalette,
    info: InstitutionInfo
  ): void {

    const infoSaneada = this.sanitizeInfo(info);

    if (this.currentMode !== 'custom') {
      const next: InstitutionSettings = { ...this.settingsSubject.value, info: infoSaneada };
      this.persist(next);
      this.sincronizarInfo(infoSaneada);
      return;
    }

    const next: InstitutionSettings = { palette: { ...palette }, info: infoSaneada };

    this.persist(next);
    this.guardarPaletaPersonalizada(palette);

    this.coloresMarcaPersonalizado = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      surface: palette.surface,
      surfaceAlt: palette.surfaceAlt
    };
    this.guardarColoresMarcaPersonalizado(this.coloresMarcaPersonalizado);

    this.sincronizarColores(palette);
    this.sincronizarInfo(infoSaneada);
  }


  updateInfo(
    info: InstitutionInfo
  ): void {

    const next: InstitutionSettings = {
      ...this.settingsSubject.value,
      info: this.sanitizeInfo(info)
    };

    this.persist(next);
    this.sincronizarInfo(next.info);
  }


  resetToDefaults(): void {

    try {
      localStorage.removeItem(CUSTOM_PALETTE_KEY);
      localStorage.removeItem(CUSTOM_BRAND_COLORS_KEY);
      localStorage.setItem(THEME_MODE_KEY, 'dark');
    } catch (error) {
      console.error('No se pudo limpiar la personalización guardada:', error);
    }

    this.coloresMarcaPersonalizado = { ...DEFAULT_BRAND_COLORS };
    this.modeSubject.next('dark');

    const infoActual = this.settingsSubject.value.info;

    const infoRestablecida: InstitutionInfo = {
      ...DEFAULT_INFO,
      logoUrl: infoActual.logoUrl,
      carousel: infoActual.carousel.map(image => ({ ...image })),
      comunidadImagenUrl: infoActual.comunidadImagenUrl,
      espaciosImagenUrl: infoActual.espaciosImagenUrl
    };

    const next: InstitutionSettings = {
      palette: { ...DEFAULT_PALETTE },
      info: this.sanitizeInfo(infoRestablecida)
    };

    this.persist(next);

    this.http.post<HttpGlobalResponse<ConfigurationResponse>>(`${this.apiUrl}/colors/reset`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this.http.put<HttpGlobalResponse<ConfigurationResponse>>(`${this.apiUrl}/info`, {
      shortName: DEFAULT_INFO.nombreCorto,
      longName: DEFAULT_INFO.nombreLargo,
      description: DEFAULT_INFO.descripcion
    }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }


  subirLogo(file: File): Observable<string | null> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<HttpGlobalResponse<ConfigurationResponse>>(
      `${this.apiUrl}/logo`,
      formData
    ).pipe(
      tap(respuesta => {
        const logoUrl = respuesta?.data?.logoUrl || '';
        const next: InstitutionSettings = {
          ...this.settingsSubject.value,
          info: { ...this.settingsSubject.value.info, logoUrl }
        };
        this.persist(next);
      }),
      map(respuesta => respuesta?.data?.logoUrl || null),
      catchError(() => of(null))
    );
  }


  eliminarLogo(): void {
    this.http.delete<HttpGlobalResponse<ConfigurationResponse>>(`${this.apiUrl}/logo`).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      const next: InstitutionSettings = {
        ...this.settingsSubject.value,
        info: { ...this.settingsSubject.value.info, logoUrl: '' }
      };
      this.persist(next);
    });
  }


  private sincronizarColores(palette: InstitutionPalette): void {
    const body = {
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
      cardBackground: palette.surface,
      secondaryBackground: palette.surfaceAlt
    };

    this.http.put<HttpGlobalResponse<ConfigurationResponse>>(`${this.apiUrl}/colors`, body).pipe(
      catchError(() => of(null))
    ).subscribe();
  }


  private sincronizarInfo(info: InstitutionInfo): void {
    const body = {
      shortName: info.nombreCorto,
      longName: info.nombreLargo,
      description: info.descripcion
    };

    this.http.put<HttpGlobalResponse<ConfigurationResponse>>(`${this.apiUrl}/info`, body).pipe(
      catchError(() => of(null))
    ).subscribe();
  }


  private persist(
    settings: InstitutionSettings
  ): void {

    this.settingsSubject.next(settings);
    this.saveLocal(settings);
    this.applySettings(settings);
  }


  private sanitizeInfo(
    info: InstitutionInfo
  ): InstitutionInfo {

    const clip = (value: string, max: number): string =>
      (value || '').slice(0, max);

    const pilaresBase =
      info.pilares && info.pilares.length > 0
        ? info.pilares
        : DEFAULT_INFO.pilares;

    const pilares = DEFAULT_INFO.pilares.map((defaultPilar, index) => {
      const pilar = pilaresBase[index] || defaultPilar;

      return {
        titulo: clip(pilar.titulo, INFO_TEXT_LIMITS.pilarTitulo),
        descripcion: clip(pilar.descripcion, INFO_TEXT_LIMITS.pilarDescripcion)
      };
    });

    return {
      ...info,

      nombreCorto: clip(info.nombreCorto, INFO_TEXT_LIMITS.nombreCorto),
      nombreLargo: clip(info.nombreLargo, INFO_TEXT_LIMITS.nombreLargo),
      descripcion: clip(info.descripcion, INFO_TEXT_LIMITS.descripcion),
      heroBadge: clip(info.heroBadge, INFO_TEXT_LIMITS.heroBadge),
      mision: clip(info.mision, INFO_TEXT_LIMITS.mision),
      vision: clip(info.vision, INFO_TEXT_LIMITS.vision),
      contactoDireccion: clip(info.contactoDireccion, INFO_TEXT_LIMITS.contactoDireccion),
      comunidadTitulo: clip(info.comunidadTitulo, INFO_TEXT_LIMITS.comunidadTitulo),
      espaciosTitulo: clip(info.espaciosTitulo, INFO_TEXT_LIMITS.espaciosTitulo),

      carousel: info.carousel.map(
        image => ({
          ...image
        })
      ),

      pilares
    };
  }


  private applySettings(
    settings: InstitutionSettings
  ): void {

    this.applyPalette(
      settings.palette
    );
  }


  private applyPalette(
    palette: InstitutionPalette
  ): void {

    const root =
      document.documentElement.style;

    root.setProperty('--inst-primary', palette.primary);
    root.setProperty('--inst-secondary', palette.secondary);
    root.setProperty('--inst-accent', palette.accent);
    root.setProperty('--inst-dark', palette.dark);
    root.setProperty('--inst-light', palette.light);
    root.setProperty('--inst-surface', palette.surface);
    root.setProperty('--inst-surface-alt', palette.surfaceAlt);
    root.setProperty('--inst-text', palette.text);
    root.setProperty('--inst-muted', palette.muted);
    root.setProperty('--inst-border', palette.border);
  }


  private guardarColoresMarcaPersonalizado(colores: BrandColors): void {
    try {
      localStorage.setItem(CUSTOM_BRAND_COLORS_KEY, JSON.stringify(colores));
    } catch (error) {
      console.error('No se pudieron guardar los colores de marca personalizados:', error);
    }
  }

  private loadCustomBrandColors(): BrandColors {
    try {
      const raw = localStorage.getItem(CUSTOM_BRAND_COLORS_KEY);
      if (!raw) return { ...DEFAULT_BRAND_COLORS };
      const parsed = JSON.parse(raw) as BrandColors;
      if (parsed?.primary && parsed?.secondary && parsed?.accent && parsed?.surface && parsed?.surfaceAlt) {
        return { ...parsed };
      }
    } catch (error) {
      console.error('No se pudieron leer los colores de marca personalizados:', error);
    }
    return { ...DEFAULT_BRAND_COLORS };
  }


  private guardarPaletaPersonalizada(palette: InstitutionPalette): void {
    try {
      localStorage.setItem(CUSTOM_PALETTE_KEY, JSON.stringify(palette));
    } catch (error) {
      console.error('No se pudo guardar la paleta personalizada:', error);
    }
  }

  private loadCustomPalette(): InstitutionPalette | null {
    try {
      const raw = localStorage.getItem(CUSTOM_PALETTE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as InstitutionPalette;
      if (parsed?.primary && parsed?.secondary && parsed?.accent && parsed?.dark && parsed?.light && parsed?.surface && parsed?.surfaceAlt && parsed?.text && parsed?.muted && parsed?.border) {
        return { ...parsed };
      }
    } catch (error) {
      console.error('No se pudo leer la paleta personalizada:', error);
    }
    return null;
  }

  private saveLocal(settings: InstitutionSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('No se pudo guardar la configuración institucional localmente:', error);
    }
  }


  private load(): InstitutionSettings {

    this.limpiarStorageLegado();

    const mode = this.loadMode();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InstitutionSettings;
        if (parsed?.info) {
          return {
            palette: this.getModePalette(mode),
            info: this.sanitizeInfo(parsed.info)
          };
        }
      }
    } catch (error) {
      console.error('No se pudo leer la configuración institucional guardada:', error);
    }

    return this.cloneDefaults();
  }


  private limpiarStorageLegado(): void {

    try {

      LEGACY_STORAGE_KEYS.forEach(key => {
        localStorage.removeItem(key);
      });

    } catch (error) {

      console.error(
        'No se pudo limpiar el almacenamiento local heredado:',
        error
      );
    }
  }


  private cloneDefaults(): InstitutionSettings {

    const mode = this.loadMode();

    return {
      palette: this.getModePalette(mode),
      info: this.sanitizeInfo(DEFAULT_INFO)
    };
  }

  ngOnDestroy(): void {
    this.detenerSincronizacion();
    window.removeEventListener('storage', this.storageListener);
  }

}