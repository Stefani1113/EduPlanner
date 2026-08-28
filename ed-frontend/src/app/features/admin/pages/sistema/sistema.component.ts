import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
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
  { key: 'dark', label: 'Texto oscuro', hint: 'Texto principal de la página' },
  { key: 'light', label: 'Blanco institucional', hint: 'Texto sobre fondos de color' }
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
  palette!: InstitutionPalette;
  info!: InstitutionInfo;
  savedMessage = '';
  private savedTimeout?: ReturnType<typeof setTimeout>;
  private sub?: Subscription;

  constructor(
    private settingsService: InstitutionSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.settingsService.settings$.subscribe(settings => {
      this.palette = { ...settings.palette };
      this.info = {
        ...settings.info,
        carousel: settings.info.carousel.map(c => ({ ...c }))
      };
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.savedTimeout) {
      clearTimeout(this.savedTimeout);
    }
  }

  onColorChange(): void {
    this.settingsService.updatePalette(this.palette);
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

  guardar(): void {
    this.settingsService.updatePalette(this.palette);
    this.settingsService.updateInfo(this.info);
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