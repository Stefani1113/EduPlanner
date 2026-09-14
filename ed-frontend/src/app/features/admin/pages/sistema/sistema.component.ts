import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  INFO_TEXT_LIMITS,
  InstitutionInfo,
  InstitutionPalette,
  InstitutionSettingsService
} from '../../services/institution-settings.service';

interface ColorSwatch {
  key: keyof InstitutionPalette;
  label: string;
  hint: string;
}

const SWATCHES: ColorSwatch[] = [
  { key: 'primary', label: 'Color primario', hint: 'Botones y acentos principales' },
  { key: 'secondary', label: 'Color secundario', hint: 'Títulos y tarjeta de visión' },
  { key: 'accent', label: 'Color de acento', hint: 'Fondos suaves y bordes' },
  { key: 'dark', label: 'Fondo general', hint: 'Fondo principal de todo el sistema' },
  { key: 'light', label: 'Blanco institucional', hint: 'Texto sobre fondos de color' },
  { key: 'surface', label: 'Fondo de tarjetas', hint: 'Paneles, tarjetas y bloques' },
  { key: 'surfaceAlt', label: 'Fondo secundario', hint: 'Campos, menús y elementos secundarios' },
  { key: 'text', label: 'Texto principal', hint: 'Títulos y contenido principal' },
  { key: 'muted', label: 'Texto secundario', hint: 'Descripciones y textos suaves' },
  { key: 'border', label: 'Bordes', hint: 'Líneas, separadores y contornos' }
];

@Component({
  selector: 'app-panel-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.scss']
})
export class PanelControlComponent implements OnInit, OnDestroy {

  swatches = SWATCHES;
  limits = INFO_TEXT_LIMITS;
  palette!: InstitutionPalette;
  info!: InstitutionInfo;
  savedMessage = '';
  colorError = '';
  private lastValidPalette!: InstitutionPalette;
  private savedTimeout?: ReturnType<typeof setTimeout>;
  private colorErrorTimeout?: ReturnType<typeof setTimeout>;
  private sub?: Subscription;

  constructor(
    private settingsService: InstitutionSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.settingsService.settings$.subscribe(settings => {
      this.palette = { ...settings.palette };
      this.lastValidPalette = { ...settings.palette };
      this.info = {
        ...settings.info,
        carousel: settings.info.carousel.map(c => ({ ...c })),
        pilares: settings.info.pilares.map(p => ({ ...p }))
      };
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.savedTimeout) {
      clearTimeout(this.savedTimeout);
    }
    if (this.colorErrorTimeout) {
      clearTimeout(this.colorErrorTimeout);
    }
  }

  atLimit(value: string | null | undefined, max: number): boolean {
    return (value?.length ?? 0) >= max;
  }

  onColorChange(key: keyof InstitutionPalette): void {
    const nuevoValor = (this.palette[key] || '').toLowerCase();

    const estaDuplicado = this.swatches.some(
      sw => sw.key !== key && (this.palette[sw.key] || '').toLowerCase() === nuevoValor
    );

    if (estaDuplicado) {
      this.palette[key] = this.lastValidPalette[key];
      this.flashColorError('Ese color ya está en uso por otro elemento de la paleta. El selector de color no está disponible para colores duplicados.');
      this.cdr.detectChanges();
      return;
    }

    this.colorError = '';
    this.lastValidPalette = { ...this.palette };
    this.settingsService.updateSettings(this.palette, this.info);
  }

  private flashColorError(message: string): void {
    this.colorError = message;
    if (this.colorErrorTimeout) {
      clearTimeout(this.colorErrorTimeout);
    }
    this.colorErrorTimeout = setTimeout(() => {
      this.colorError = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.info.logoUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onCarouselFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.info.carousel[index] = { url: reader.result as string };
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  addCarouselImage(): void {
    if (this.info.carousel.length >= 4) return;
    this.info.carousel.push({ url: '' });
  }

  removeCarouselImage(index: number): void {
    this.info.carousel.splice(index, 1);
  }

  onComunidadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.info.comunidadImagenUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onEspaciosFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.info.espaciosImagenUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  guardar(): void {
    this.settingsService.updateSettings(this.palette, this.info);
    this.flashSaved('Cambios guardados');
  }

  restablecer(): void {
    this.settingsService.resetToDefaults();
    this.flashSaved('Valores por defecto restaurados');
  }

  private flashSaved(message: string): void {
    this.savedMessage = message;
    if (this.savedTimeout) {
      clearTimeout(this.savedTimeout);
    }
    this.savedTimeout = setTimeout(() => {
      this.savedMessage = '';
      this.cdr.detectChanges();
    }, 2500);
  }
}