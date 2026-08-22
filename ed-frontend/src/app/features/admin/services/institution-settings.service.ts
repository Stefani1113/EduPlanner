import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface InstitutionPalette {
  primary: string;  
  secondary: string; 
  accent: string;   
  dark: string;  
  light: string;    
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

const STORAGE_KEY = 'eduplanner.institution-settings';

const DEFAULT_PALETTE: InstitutionPalette = {
  primary: '#0b6f78',
  secondary: '#168a94',
  accent: '#b9dfe0',
  dark: '#172126',
  light: '#ffffff'
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

const DEFAULT_SETTINGS: InstitutionSettings = {
  palette: { ...DEFAULT_PALETTE },
  info: { ...DEFAULT_INFO }
};

@Injectable({ providedIn: 'root' })
export class InstitutionSettingsService {

  private settingsSubject = new BehaviorSubject<InstitutionSettings>(this.load());
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
      info: { ...info, carousel: [...info.carousel] }
    };
    this.persist(next);
  }

  resetToDefaults(): void {
    this.persist({
      palette: { ...DEFAULT_PALETTE },
      info: { ...DEFAULT_INFO, carousel: DEFAULT_INFO.carousel.map(c => ({ ...c })) }
    });
  }

  private persist(settings: InstitutionSettings): void {
    this.settingsSubject.next(settings);
    this.applyPalette(settings.palette);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
    }
  }

  private applyPalette(palette: InstitutionPalette): void {
    const root = document.documentElement.style;
    root.setProperty('--inst-primary', palette.primary);
    root.setProperty('--inst-secondary', palette.secondary);
    root.setProperty('--inst-accent', palette.accent);
    root.setProperty('--inst-dark', palette.dark);
    root.setProperty('--inst-light', palette.light);
  }

  private load(): InstitutionSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { palette: { ...DEFAULT_PALETTE }, info: { ...DEFAULT_INFO } };
      }
      const parsed = JSON.parse(raw) as Partial<InstitutionSettings>;
      return {
        palette: { ...DEFAULT_PALETTE, ...parsed.palette },
        info: {
          ...DEFAULT_INFO,
          ...parsed.info,
          carousel: parsed.info?.carousel?.length ? parsed.info.carousel : DEFAULT_INFO.carousel
        }
      };
    } catch {
      return { palette: { ...DEFAULT_PALETTE }, info: { ...DEFAULT_INFO } };
    }
  }
}
