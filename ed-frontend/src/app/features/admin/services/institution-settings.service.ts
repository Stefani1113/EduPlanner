import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
{
url: 'assets/img/institucion-edificio.png'
},
{
url: 'assets/img/estudiantes-institucion.png'
}
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
descripcion:
'Desarrollamos competencias académicas, sociales y personales.'
},
{
titulo: 'Innovación',
descripcion:
'Integramos tecnología y nuevas metodologías al aprendizaje.'
},
{
titulo: 'Comunidad',
descripcion:
'Construimos una comunidad educativa basada en respeto y colaboración.'
}
],

comunidadImagenUrl:
'assets/img/estudiantes-institucion.png',

comunidadTitulo:
'Comunidad educativa',

espaciosImagenUrl:
'assets/img/carrucel-libreria.png',

espaciosTitulo:
'Espacios educativos'
};

@Injectable({
providedIn: 'root'
})
export class InstitutionSettingsService {


private readonly API_URL =
'http://localhost:8080/administracion/institution-settings';

private readonly settingsSubject =
new BehaviorSubject<InstitutionSettings>(
this.cloneDefaults()
);

readonly settings$ =
this.settingsSubject.asObservable();

constructor(
private http: HttpClient
) {
this.cargarConfiguracion();
}


get current(): InstitutionSettings {
return this.settingsSubject.value;
}


cargarConfiguracion(): void {
this.http
.get<InstitutionSettings>(this.API_URL)
.pipe(
catchError(error => {
console.error(
'No se pudo cargar la configuración institucional:',
error
);

 const defaults =
   this.cloneDefaults();

 this.settingsSubject.next(
   defaults
 );

 this.applySettings(
   defaults
 );

 return of(defaults);

})
)
.subscribe(settings => {
const configuracion =
this.normalizeSettings(settings);

this.settingsSubject.next(
configuracion
);

this.applySettings(
configuracion
);
});
}


activarTemaSesion(): void {
this.applyPalette(
this.settingsSubject.value.palette
);
}


activarTemaPreview(
palette: InstitutionPalette
): void {
this.applyPalette(palette);
}


restaurarTemaPorDefecto(): void {
const root =
document.documentElement.style;
root.removeProperty(
  '--inst-primary'
);

root.removeProperty(
  '--inst-secondary'
);

root.removeProperty(
  '--inst-accent'
);

root.removeProperty(
  '--inst-dark'
);

root.removeProperty(
  '--inst-light'
);

root.removeProperty(
  '--inst-surface'
);

root.removeProperty(
  '--inst-surface-alt'
);

root.removeProperty(
  '--inst-text'
);

root.removeProperty(
  '--inst-muted'
);

root.removeProperty(
  '--inst-border'
);

}


updatePalette(
palette: InstitutionPalette
): Observable<InstitutionSettings> {
const next: InstitutionSettings = {
  ...this.settingsSubject.value,

  palette: {
    ...palette
  }
};

return this.guardarEnBackend(next);

}


updateInfo(
info: InstitutionInfo
): Observable<InstitutionSettings> {
const next: InstitutionSettings = {
  ...this.settingsSubject.value,

  info: this.sanitizeInfo(info)
};

return this.guardarEnBackend(next);

}


updateSettings(
palette: InstitutionPalette,
info: InstitutionInfo
): Observable<InstitutionSettings> {
const next: InstitutionSettings = {
  palette: {
    ...palette
  },

  info: this.sanitizeInfo(info)
};

return this.guardarEnBackend(next);

}


resetToDefaults():
Observable<InstitutionSettings> {
const next: InstitutionSettings =
  this.cloneDefaults();

return this.guardarEnBackend(next);

}


private guardarEnBackend(
settings: InstitutionSettings
): Observable<InstitutionSettings> {
const configuracion =
  this.normalizeSettings(settings);

this.settingsSubject.next(
  configuracion
);

this.applySettings(
  configuracion
);

return this.http
  .put<InstitutionSettings>(
    this.API_URL,
    configuracion
  )
  .pipe(
    tap(response => {

      const guardada =
        this.normalizeSettings(response);

      this.settingsSubject.next(
        guardada
      );

      this.applySettings(
        guardada
      );
    }),

    catchError(error => {

      console.error(
        'Error guardando la configuración institucional:',
        error
      );


      return of(configuracion);
    })
  );

}


private normalizeSettings(
settings: InstitutionSettings
): InstitutionSettings {
const palette: InstitutionPalette = {
  ...DEFAULT_PALETTE,
  ...(settings?.palette || {})
};

const info: InstitutionInfo =
  this.sanitizeInfo({
    ...DEFAULT_INFO,
    ...(settings?.info || {})
  });

return {
  palette,
  info
};

}


private sanitizeInfo(
info: InstitutionInfo
): InstitutionInfo {
const clip = (
  value: string | null | undefined,
  max: number
): string => {
  return (value || '').slice(0, max);
};

const pilaresBase =
  info?.pilares &&
  info.pilares.length > 0
    ? info.pilares
    : DEFAULT_INFO.pilares;

const pilares =
  DEFAULT_INFO.pilares.map(
    (defaultPilar, index) => {

      const pilar =
        pilaresBase[index] ||
        defaultPilar;

      return {
        titulo: clip(
          pilar.titulo,
          INFO_TEXT_LIMITS.pilarTitulo
        ),

        descripcion: clip(
          pilar.descripcion,
          INFO_TEXT_LIMITS.pilarDescripcion
        )
      };
    }
  );

return {
  ...DEFAULT_INFO,
  ...info,

  nombreCorto:
    clip(
      info?.nombreCorto,
      INFO_TEXT_LIMITS.nombreCorto
    ),

  nombreLargo:
    clip(
      info?.nombreLargo,
      INFO_TEXT_LIMITS.nombreLargo
    ),

  descripcion:
    clip(
      info?.descripcion,
      INFO_TEXT_LIMITS.descripcion
    ),

  heroBadge:
    clip(
      info?.heroBadge,
      INFO_TEXT_LIMITS.heroBadge
    ),

  mision:
    clip(
      info?.mision,
      INFO_TEXT_LIMITS.mision
    ),

  vision:
    clip(
      info?.vision,
      INFO_TEXT_LIMITS.vision
    ),

  contactoDireccion:
    clip(
      info?.contactoDireccion,
      INFO_TEXT_LIMITS.contactoDireccion
    ),

  comunidadTitulo:
    clip(
      info?.comunidadTitulo,
      INFO_TEXT_LIMITS.comunidadTitulo
    ),

  espaciosTitulo:
    clip(
      info?.espaciosTitulo,
      INFO_TEXT_LIMITS.espaciosTitulo
    ),

  carousel:
    Array.isArray(info?.carousel)
      ? info.carousel.map(
          image => ({
            ...image
          })
        )
      : DEFAULT_INFO.carousel.map(
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

private cloneDefaults(): InstitutionSettings {
return {
  palette: {
    ...DEFAULT_PALETTE
  },

  info: {
    ...DEFAULT_INFO,

    carousel:
      DEFAULT_INFO.carousel.map(
        image => ({
          ...image
        })
      ),

    pilares:
      DEFAULT_INFO.pilares.map(
        pilar => ({
          ...pilar
        })
      )
  }
};

}
}