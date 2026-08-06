import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Controla la visibilidad del sidebar en pantallas pequeñas (menú "hamburguesa").
 * El topbar lo abre/cierra y el sidebar se suscribe para mostrarse como panel
 * deslizante en vez de aplastar o taparse con el contenido.
 */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  private openSubject = new BehaviorSubject<boolean>(false);
  open$ = this.openSubject.asObservable();

  toggle(): void {
    this.openSubject.next(!this.openSubject.value);
  }

  close(): void {
    if (this.openSubject.value) {
      this.openSubject.next(false);
    }
  }
}
