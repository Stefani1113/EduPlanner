import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalModalComponent } from './core/components/global-modal/global-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    GlobalModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ed-frontend';
}