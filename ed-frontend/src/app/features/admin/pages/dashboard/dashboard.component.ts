import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  InstitutionInfo,
  InstitutionSettingsService
} from '../../services/institution-settings.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  info$: Observable<InstitutionInfo>;
  currentSlide: number = 0;
  private slideInterval: Subscription | null = null;
  private readonly AUTOPLAY_DELAY = 5000;

  private heroCarouselImages = [
    '/assets/img/img-principal.png',
    '/assets/img/carrucel.png',
    '/assets/img/carrucel-libreria.png',
  ];

  constructor(private settingsService: InstitutionSettingsService) {
    this.info$ = this.settingsService.settings$.pipe(
      map(settings => {
        const info = settings.info;
        
        info.carousel = this.heroCarouselImages.map(url => ({ url }));
        
        return info;
      })
    );
  }

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  carouselUrl(info: InstitutionInfo, index: number, fallback: string): string {
    return info.carousel[index]?.url || fallback;
  }

  goToSlide(index: number, info: InstitutionInfo): void {
    if (index >= 0 && index < info.carousel.length) {
      this.currentSlide = index;
      this.resetAutoplay();
    }
  }

  nextSlide(info: InstitutionInfo): void {
    if (info.carousel.length > 0) {
      this.currentSlide = (this.currentSlide + 1) % info.carousel.length;
      this.resetAutoplay();
    }
  }

  prevSlide(info: InstitutionInfo): void {
    if (info.carousel.length > 0) {
      this.currentSlide = (this.currentSlide - 1 + info.carousel.length) % info.carousel.length;
      this.resetAutoplay();
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.slideInterval = interval(this.AUTOPLAY_DELAY).subscribe(() => {
      this.info$.subscribe(info => {
        if (info.carousel.length > 0) {
          this.currentSlide = (this.currentSlide + 1) % info.carousel.length;
        }
      }).unsubscribe();
    });
  }

  private stopAutoplay(): void {
    if (this.slideInterval) {
      this.slideInterval.unsubscribe();
      this.slideInterval = null;
    }
  }

  private resetAutoplay(): void {
    this.startAutoplay();
  }
}