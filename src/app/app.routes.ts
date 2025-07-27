import { Routes } from '@angular/router';
import { roleGuard } from './shared/guards/role.guard';
import { Rol } from './shared/enums/rol.enum';
import { onBoardingGuard } from './shared/guards/onBoarding.guard';

export const routes: Routes = [

  // 1️⃣ Redirige la ruta raíz al módulo de auth
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  // 2️⃣ Carga el módulo de auth
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.AuthRoutes) },
  // 3️⃣ Ruta de onboarding
  { path: 'onboarding', loadComponent: () => import('./auth/onboarding/onboarding').then(m => m.Onboarding), canActivate: [onBoardingGuard] },
  // 4️⃣ Rutas protegidas por roles
  { path: '', loadComponent: () => import('./layout/layout').then(m => m.Layout), children: [
      {
        path: 'cliente',
        loadChildren: () => import('./clientes/clientes-routes').then(m => m.default),
        canActivate: [roleGuard([Rol.CLIENTE]),onBoardingGuard]
      },
      {
        path: 'entrenador',
        loadChildren: () => import('./entrenadores/entrenadores-routes').then(m => m.default),
        canActivate: [roleGuard([Rol.ENTRENADOR]),onBoardingGuard]
      },
      {
        path: 'gimnasio',
        canActivate: [roleGuard([Rol.GIMNASIO, Rol.PERSONAL_TRAINER]), onBoardingGuard],
        loadChildren: () => import('./gimnasios/gimnasios-routes').then(m => m.default)
      },
      {
        path: 'personal-trainer',
        loadChildren: () => import('./personal-trainers/personal-trainer-routes').then(m => m.default),
        canActivate: [roleGuard([Rol.PERSONAL_TRAINER]), onBoardingGuard]
      }
    ]
  },
  // 5️⃣ Wildcard: cualquier ruta “rara” vuelve a welcome
  { path: '**', redirectTo: 'auth/welcome' }
];

