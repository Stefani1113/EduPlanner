import { Component } from '@angular/core';
import { Observable } from 'rxjs';
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
export class DashboardComponent {

  info$: Observable<InstitutionInfo>;

  constructor(private settingsService: InstitutionSettingsService) {
    this.info$ = this.settingsService.settings$.pipe(
      map(settings => settings.info)
    );
  }

  carouselUrl(info: InstitutionInfo, index: number, fallback: string): string {
    return info.carousel[index]?.url || fallback;
  }
}
