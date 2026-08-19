import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from '../auth/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          breadcrumb: ['Mi institución']
        }
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent),
        data: {
          breadcrumb: ['Usuarios']
        }
      },

      {
        path: 'horarios',
        loadComponent: () =>
          import('./pages/horarios/horarios.component')
            .then(m => m.HorariosComponent),
        data: {
          breadcrumb: ['Horarios']
        }
      },

      {
        path: 'emergencia',
        loadComponent: () =>
          import('./pages/emergencia/emergencia.component')
            .then(m => m.EmergenciaComponent),
        data: {
          breadcrumb: ['Emergencia']
        }
      },

      {
        path: 'docentes',
        loadComponent: () =>
          import('./pages/docentes/docentes.component')
            .then(m => m.DocentesComponent),
        data: {
          breadcrumb: ['Docentes']
        }
      },

      {
        path: 'asistencia',
        loadComponent: () =>
          import('./pages/asistencia/asistencia.component')
            .then(m => m.AsistenciaComponent),
        data: {
          breadcrumb: ['Asistencia']
        }
      },

      {
        path: 'notas',
        loadComponent: () =>
          import('./pages/notas/notas.component')
            .then(m => m.NotasComponent),
        data: {
          breadcrumb: ['Notas']
        }
      },

      {
        path: 'importacion',
        loadComponent: () =>
          import('./pages/importacion/importacion.component')
            .then(m => m.ImportacionComponent),
        data: {
          breadcrumb: ['Importación']
        }
      },

      {
        path: 'sistema',
        loadComponent: () =>
          import('./pages/sistema/sistema.component')
              .then(m => m.PanelControlComponent),
        data: {
          breadcrumb: ['sistema']
        }
      }

    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AdminRoutingModule {}