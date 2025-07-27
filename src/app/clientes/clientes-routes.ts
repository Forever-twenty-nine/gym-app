import { Routes } from '@angular/router';
import { Cliente } from './cliente/cliente';
import { Rutinas } from '../shared/components/rutinas/rutinas';
import { Notificaciones } from '../shared/components/notificaciones/notificaciones';

const routes: Routes = [
  { path: 'inicio-cliente', component: Cliente },
  { path: 'rutinas-cliente', component: Rutinas },
  { path: 'notificaciones-cliente', component: Notificaciones },
  { path: '', redirectTo: 'inicio-cliente', pathMatch: 'full' }
];
export default routes;