import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private extraSubject = new BehaviorSubject<string | null>(null);
  extra$ = this.extraSubject.asObservable();

  setExtra(value: string | null): void {
    this.extraSubject.next(value);
  }
}