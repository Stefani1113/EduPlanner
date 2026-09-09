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

export interface InstitutionInfo {
  logoUrl: string;
  nombreCorto: string;
  nombreLargo: string;
  descripcion: string;
  carousel: CarouselImage[];
  mision: string;
  vision: string;
  contactoDireccion: string;
  reglamentoUrl: string;
  construccionLegalUrl: string;
}

export interface InstitutionSettings {
  palette: InstitutionPalette;
  info: InstitutionInfo;
}

const STORAGE_KEY = 'eduplanner.institution-settings.v2';

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
  mision:
    'Formar líderes integrales con capacidad crítica, ética y creativa, capaces de transformar la sociedad mediante el conocimiento y la innovación.',
  vision:
    'Ser una institución reconocida por su innovación educativa, compromiso social y capacidad de transformar positivamente su entorno.',
  contactoDireccion: 'Calle 10 # 8-25 · Barcelona, Quindío',
  reglamentoUrl: '',
  construccionLegalUrl: ''
};

@Injectable({
  providedIn: 'root'
})
export class InstitutionSettingsService {

  private settingsSubject = new BehaviorSubject<InstitutionSettings>(
    this.load()
  );

  settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.applyPalette(this.settingsSubject.value.palette);
  }

  get current(): InstitutionSettings {
    return this.settingsSubject.value;
  }

  updatePalette(palette: InstitutionPalette): void {
    const next: InstitutionSettings = {
      ...this.settingsSubject.value,
      palette: { ...palette }
    };

    this.persist(next);
  }

  updateInfo(info: InstitutionInfo): void {
    const next: InstitutionSettings = {
      ...this.settingsSubject.value,
      info: {
        ...info,
        carousel: info.carousel.map(image => ({
          ...image
        }))
      }
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

      info: {
        ...info,

        carousel: info.carousel.map(image => ({
          ...image
        }))
      }
    };

    this.persist(next);
  }

  resetToDefaults(): void {

    const next: InstitutionSettings = {
      palette: {
        ...DEFAULT_PALETTE
      },

      info: {
        ...DEFAULT_INFO,

        carousel: DEFAULT_INFO.carousel.map(image => ({
          ...image
        }))
      }
    };

    this.persist(next);
  }

  private persist(settings: InstitutionSettings): void {

    this.settingsSubject.next(settings);

    this.applyPalette(settings.palette);

    try {

      const data = JSON.stringify(settings);

      localStorage.setItem(STORAGE_KEY, data);
      sessionStorage.setItem(STORAGE_KEY, data);

    } catch (error) {

      console.error(
        'No se pudieron guardar las configuraciones:',
        error
      );
    }
  }

  private applyPalette(
    palette: InstitutionPalette
  ): void {

    const root = document.documentElement.style;

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

    try {

      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        sessionStorage.getItem(STORAGE_KEY);

      if (!raw) {

        return {
          palette: {
            ...DEFAULT_PALETTE
          },

          info: {
            ...DEFAULT_INFO,

            carousel: DEFAULT_INFO.carousel.map(image => ({
              ...image
            }))
          }
        };
      }

      const parsed =
        JSON.parse(raw) as Partial<InstitutionSettings>;

      return {

        palette: {
          ...DEFAULT_PALETTE,
          ...(parsed.palette || {})
        },

        info: {

          ...DEFAULT_INFO,

          ...(parsed.info || {}),

          carousel:
            parsed.info?.carousel &&
            parsed.info.carousel.length > 0

              ? parsed.info.carousel.map(image => ({
                  ...image
                }))

              : DEFAULT_INFO.carousel.map(image => ({
                  ...image
                }))
        }
      };

    } catch (error) {

      console.error(
        'Error cargando configuración institucional:',
        error
      );

      return {
        palette: {
          ...DEFAULT_PALETTE
        },

        info: {
          ...DEFAULT_INFO,

          carousel: DEFAULT_INFO.carousel.map(image => ({
            ...image
          }))
        }
      };
    }
  }
}