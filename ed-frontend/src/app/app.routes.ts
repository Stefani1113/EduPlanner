import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  {
    path: 'inicio',
    loadChildren: () =>
      import('./features/home/home.module').then(m => m.HomeModule)
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  {
  path: 'activate',
  loadComponent: () =>
    import('./features/admin/pages/Account-activation/Account-activation.component')
      .then(m => m.AccountActivationComponent)
},
];