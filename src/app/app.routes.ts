import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.default)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./auth/onboarding/onboarding').then(m => m.Onboarding)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'cliente',
        loadChildren: () => import('./clientes/clientes-routes').then(m => m.default)
      },
      {
        path: 'entrenador',
        loadChildren: () => import('./entrenadores/entrenadores-routes').then(m => m.default)
      },
      {
        path: 'gimnasio',
        loadChildren: () => import('./gimnasios/gimnasios-routes').then(m => m.default)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

