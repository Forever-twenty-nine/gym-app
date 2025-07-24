import { Routes } from '@angular/router';
import { Entrenador } from './entrenador/entrenador';
import { Rutinas } from '../shared/components/rutinas/rutinas';
import { Ejercicios } from '../shared/components/ejercicios/ejercicios';
import { ClientesComponent } from '../shared/components/clientes-component/clientes.component';
import { Notificaciones } from '../shared/components/notificaciones/notificaciones';

const routes: Routes = [
  { path: '', component: Entrenador },
  { path: 'rutinas', component: Rutinas },
  { path: 'ejercicios', component: Ejercicios },
  { path: 'notificaciones', component: Notificaciones },
  { path: 'clientes', component: ClientesComponent }
];

export default routes;