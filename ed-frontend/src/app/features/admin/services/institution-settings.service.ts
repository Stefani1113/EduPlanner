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
const BRAND_COLORS_KEY = 'eduplanner.brand-colors';
const SYNC_INTERVAL_MS = 15000;

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

const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: DEFAULT_PALETTE.primary,
  secondary: DEFAULT_PALETTE.secondary,
  accent: DEFAULT_PALETTE.accent
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

  private ultimosColoresMarca: BrandColors = this.loadBrandColors();

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

    if (event.key === BRAND_COLORS_KEY && event.newValue) {
      try {
        this.ultimosColoresMarca = JSON.parse(event.newValue) as BrandColors;
        this.applyModePalette(this.currentMode);
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
        this.ultimosColoresMarca = {
          primary: config.primaryColor || this.ultimosColoresMarca.primary,
          secondary: config.secondaryColor || this.ultimosColoresMarca.secondary,
          accent: config.accentColor || this.ultimosColoresMarca.accent
        };
        this.guardarColoresMarca(this.ultimosColoresMarca);
      }

      const palette = this.getModePalette(this.currentMode, this.settingsSubject.value.palette);
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
    const palette = this.getModePalette(mode, this.settingsSubject.value.palette);
    const next = {
      ...this.settingsSubject.value,
      palette
    };

    this.settingsSubject.next(next);
    this.saveLocal(next);
    this.applyPalette(palette);
  }

  private getModePalette(
    mode: ThemeMode,
    institutionPalette: InstitutionPalette
  ): InstitutionPalette {

    if (mode === 'custom') {
      return {
        ...(this.loadCustomPalette() || institutionPalette)
      };
    }

    const preset = mode === 'light' ? LIGHT_PALETTE : DEFAULT_PALETTE;

    // Oscuro y Claro son presets completos (fondos, texto, bordes) más los
    // 3 colores de identidad de la institución.
    return {
      ...preset,
      primary: this.ultimosColoresMarca.primary,
      secondary: this.ultimosColoresMarca.secondary,
      accent: this.ultimosColoresMarca.accent
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
   * Guarda la paleta editada desde el panel de administración.
   *
   * Oscuro y Claro son temas fijos: si el administrador cambia cualquier
   * color estando en uno de ellos, el sistema pasa automáticamente a
   * "Personalizado" y conserva ese cambio (partiendo de los colores que se
   * veían en pantalla). Guardar solo la información institucional, sin
   * tocar colores, NO cambia el modo.
   *
   * La paleta personalizada vive solo en "Personalizado": no toca los
   * colores de marca ni el backend, así no contamina Oscuro ni Claro.
   */
  updateSettings(
    palette: InstitutionPalette,
    info: InstitutionInfo
  ): void {

    const infoSaneada = this.sanitizeInfo(info);
    const cambioColores = this.paletaCambio(palette, this.settingsSubject.value.palette);

    if (this.currentMode === 'custom' || cambioColores) {

      // Guardar primero: setMode('custom') lee la paleta personalizada.
      this.guardarPaletaPersonalizada(palette);

      if (this.currentMode !== 'custom') {
        this.setMode('custom');
      }

      this.persist({ palette: { ...palette }, info: infoSaneada });
      this.sincronizarInfo(infoSaneada);
      return;
    }

    // Oscuro / Claro sin cambios de color: solo se guarda la información.
    this.persist({ ...this.settingsSubject.value, info: infoSaneada });
    this.sincronizarInfo(infoSaneada);
  }

  private paletaCambio(a: InstitutionPalette, b: InstitutionPalette): boolean {
    return (Object.keys(a) as (keyof InstitutionPalette)[])
      .some(key => (a[key] || '').toLowerCase() !== (b[key] || '').toLowerCase());
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
      localStorage.removeItem(BRAND_COLORS_KEY);
      localStorage.setItem(THEME_MODE_KEY, 'dark');
    } catch (error) {
      console.error('No se pudo limpiar la personalización guardada:', error);
    }

    this.ultimosColoresMarca = { ...DEFAULT_BRAND_COLORS };
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


  private actualizarColoresMarcaDesde(palette: InstitutionPalette): void {
    this.ultimosColoresMarca = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent
    };
    this.guardarColoresMarca(this.ultimosColoresMarca);
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


  private guardarColoresMarca(colores: BrandColors): void {
    try {
      localStorage.setItem(BRAND_COLORS_KEY, JSON.stringify(colores));
    } catch (error) {
      console.error('No se pudieron guardar los colores de marca:', error);
    }
  }

  private loadBrandColors(): BrandColors {
    try {
      const raw = localStorage.getItem(BRAND_COLORS_KEY);
      if (!raw) return { ...DEFAULT_BRAND_COLORS };
      const parsed = JSON.parse(raw) as BrandColors;
      if (parsed?.primary && parsed?.secondary && parsed?.accent) {
        return { primary: parsed.primary, secondary: parsed.secondary, accent: parsed.accent };
      }
    } catch (error) {
      console.error('No se pudieron leer los colores de marca guardados:', error);
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
            palette: this.getModePalette(mode, parsed.palette || DEFAULT_PALETTE),
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
      palette: this.getModePalette(mode, DEFAULT_PALETTE),
      info: this.sanitizeInfo(DEFAULT_INFO)
    };
  }

  ngOnDestroy(): void {
    this.detenerSincronizacion();
    window.removeEventListener('storage', this.storageListener);
  }

}