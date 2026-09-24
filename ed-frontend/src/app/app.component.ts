import {Component,OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalModalComponent } from './core/components/global-modal/global-modal.component';
import { AuthService } from './features/auth/services/auth.service';

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
export class AppComponent implements OnInit {

  title = 'ed-frontend';

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.authService
      .iniciarRenovacionAutomatica();
  }
}