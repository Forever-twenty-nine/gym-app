import { Routes } from '@angular/router';
import { roleGuard } from './shared/guards/role.guard';
import { Rol } from './shared/enums/rol.enum';
import { onBoardingGuard } from './shared/guards/onBoarding.guard';
import { authGuard } from './shared/guards/auth.guard';




export const routes: Routes = [

  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AuthRoutes)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./auth/onboarding/onboarding').then(m => m.Onboarding),
    canActivate: [onBoardingGuard]
  },
  {
    path: 'gimnasio',
    canActivate: [roleGuard([Rol.GIMNASIO, Rol.PERSONAL_TRAINER])],
    loadChildren: () => import('./tabs-gimnasios/tabs-gimnasios-routes').then(m => m.default)
  },
  {
    path: 'cliente',
    canActivate: [roleGuard([Rol.CLIENTE])],
    loadChildren: () => import('./clientes/clientes-routes').then(m => m.default),
  },
  {
    path: 'entrenador',
    canActivate: [roleGuard([Rol.ENTRENADOR])],
    loadChildren: () => import('./entrenadores/entrenadores-routes').then(m => m.default),

  },
  {
    path: 'personal-trainer',
    canActivate: [roleGuard([Rol.PERSONAL_TRAINER])],
    loadChildren: () => import('./personal-trainers/personal-trainer-routes').then(m => m.default),

  }
  ,
  { path: '**', redirectTo: 'auth/welcome' }
];

