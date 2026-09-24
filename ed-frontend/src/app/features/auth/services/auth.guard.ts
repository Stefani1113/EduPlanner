import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  router.navigate(['/auth'], { queryParams: { redirectTo: state.url } });
  return false;
};
