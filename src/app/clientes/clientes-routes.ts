import { Routes } from '@angular/router';
import { Cliente } from './cliente/cliente';
import { Rutinas } from '../shared/components/rutinas/rutinas';
import { Notificaciones } from '../shared/components/notificaciones/notificaciones';

const routes: Routes = [
  { path: '', component: Cliente },
  // rutinas
  { path: 'rutinas', component: Rutinas },
  { path: 'notificaciones', component: Notificaciones }
];
export default routes;