import { Routes } from '@angular/router';
import { Entrenador } from './entrenador/entrenador';
import { Rutinas } from '../shared/components/rutinas/rutinas';
import { Ejercicios } from '../shared/components/ejercicios/ejercicios';
import { Clientes } from '../shared/components/clientes/clientes';
import { Notificaciones } from '../shared/components/notificaciones/notificaciones';

const routes: Routes = [
  { path: '', component: Entrenador },
  { path: 'rutinas', component: Rutinas },
  { path: 'ejercicios', component: Ejercicios },
  { path: 'notificaciones', component: Notificaciones },
  { path: 'clientes', component: Clientes }
];

export default routes;