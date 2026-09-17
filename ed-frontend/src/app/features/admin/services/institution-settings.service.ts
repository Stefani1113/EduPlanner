import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

export type ThemeMode = 'dark' | 'light';

const THEME_MODE_KEY = 'eduplanner.theme-mode';

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

  constructor() {}


  get current(): InstitutionSettings {
    return this.settingsSubject.value;
  }

  get currentMode(): ThemeMode {
    return this.modeSubject.value;
  }


  // Cambia entre el preset claro y oscuro, y lo aplica de inmediato.
  setMode(mode: ThemeMode): void {

    this.modeSubject.next(mode);

    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error('No se pudo guardar la preferencia de tema:', error);
    }

    this.updatePalette(
      mode === 'light' ? { ...LIGHT_PALETTE } : { ...DEFAULT_PALETTE }
    );
  }


  private loadMode(): ThemeMode {

    try {
      return localStorage.getItem(THEME_MODE_KEY) === 'light'
        ? 'light'
        : 'dark';
    } catch (error) {
      return 'dark';
    }
  }


  activarTemaSesion(): void {
    this.applyPalette(this.settingsSubject.value.palette);
  }


  restaurarTemaPorDefecto(): void {
    const root = document.documentElement.style;

    root.removeProperty('--inst-primary');
    root.removeProperty('--inst-secondary');
    root.removeProperty('--inst-accent');
    root.removeProperty('--inst-dark');
    root.removeProperty('--inst-light');
    root.removeProperty('--inst-surface');
    root.removeProperty('--inst-surface-alt');
    root.removeProperty('--inst-text');
    root.removeProperty('--inst-muted');
    root.removeProperty('--inst-border');
  }


  updatePalette(
    palette: InstitutionPalette
  ): void {

    const next: InstitutionSettings = {
      ...this.settingsSubject.value,

      palette: {
        ...palette
      }
    };

    this.persist(next);
  }


  updateInfo(
    info: InstitutionInfo
  ): void {

    const next: InstitutionSettings = {

      ...this.settingsSubject.value,

      info: this.sanitizeInfo(info)
    };

    this.persist(next);
  }


  updateSettings(
    palette: InstitutionPalette,
    info: InstitutionInfo
  ): void {

    const next: InstitutionSettings = {

      palette: {
        ...palette
      },

      info: this.sanitizeInfo(info)
    };

    this.persist(next);
  }


  resetToDefaults(): void {

    const paletteBase =
      this.currentMode === 'light' ? LIGHT_PALETTE : DEFAULT_PALETTE;

    const next: InstitutionSettings = {

      palette: {
        ...paletteBase
      },

      info: this.sanitizeInfo(DEFAULT_INFO)
    };

    this.persist(next);
  }


  private persist(
    settings: InstitutionSettings
  ): void {

    this.settingsSubject.next(settings);

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

    root.setProperty(
      '--inst-primary',
      palette.primary
    );

    root.setProperty(
      '--inst-secondary',
      palette.secondary
    );

    root.setProperty(
      '--inst-accent',
      palette.accent
    );

    root.setProperty(
      '--inst-dark',
      palette.dark
    );

    root.setProperty(
      '--inst-light',
      palette.light
    );

    root.setProperty(
      '--inst-surface',
      palette.surface
    );

    root.setProperty(
      '--inst-surface-alt',
      palette.surfaceAlt
    );

    root.setProperty(
      '--inst-text',
      palette.text
    );

    root.setProperty(
      '--inst-muted',
      palette.muted
    );

    root.setProperty(
      '--inst-border',
      palette.border
    );
  }


  private load(): InstitutionSettings {



    this.limpiarStorageLegado();

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

    const paletteBase =
      this.loadMode() === 'light' ? LIGHT_PALETTE : DEFAULT_PALETTE;

    return {

      palette: {
        ...paletteBase
      },

      info: this.sanitizeInfo(DEFAULT_INFO)
    };
  }
}