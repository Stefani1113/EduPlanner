import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


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
