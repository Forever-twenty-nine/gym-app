import { Routes } from '@angular/router';
import { Entrenador } from './entrenador/entrenador';
import { Rutinas } from '../shared/components/rutinas/rutinas';
import { Ejercicios } from '../shared/components/ejercicios/ejercicios';
import { Clientes } from '../shared/components/clientes/clientes';
import { Notificaciones } from '../shared/components/notificaciones/notificaciones';

const routes: Routes = [
  { path: 'inicio-entrenador', component: Entrenador },
  { path: 'rutinas-entrenador', component: Rutinas },
  { path: 'ejercicios-entrenador', component: Ejercicios },
  { path: 'clientes-entrenador', component: Clientes },
  { path: 'notificaciones-entrenador', component: Notificaciones },
  { path: '', redirectTo: 'inicio-entrenador', pathMatch: 'full' }
];

export default routes;