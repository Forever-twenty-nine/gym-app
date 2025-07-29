import { Routes } from '@angular/router';
import { TabsGimnasio } from './tabs-gimnasios';

const routes: Routes = [
  {
    path: '',
    component: TabsGimnasio,
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('../gimnasio/gimnasio').then((m) => m.Gimnasio),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('../shared/components/clientes/clientes').then((m) => m.Clientes),
      },
      {
        path: 'entrenadores',
        loadComponent: () =>
          import('../shared/components/entrenadores/entrenadores').then((m) => m.Entrenadores),
      },
      {
        path: 'invitaciones',
        loadComponent: () =>
          import('../shared/components/invitaciones/invitaciones').then((m) => m.Invitaciones),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
];
export default routes;