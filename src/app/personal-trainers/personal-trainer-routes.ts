import { Routes } from '@angular/router';
import { PersonalTrainer } from './personal-trainer/personal-trainer';
import { Clientes } from '../shared/components/clientes/clientes';
import { Rutinas } from '../shared/components/rutinas/rutinas';
import { Ejercicios } from '../shared/components/ejercicios/ejercicios';
import { Invitaciones } from '../shared/components/invitaciones/invitaciones';


const routes: Routes = [
  { path: 'inicio-pt', component: PersonalTrainer },
  { path: 'clientes-pt', component: Clientes },
  { path: 'rutinas-pt', component: Rutinas },
  { path: 'ejercicios-pt', component: Ejercicios },
  { path: 'invitaciones-pt', component: Invitaciones },
  { path: '', redirectTo: 'inicio-pt', pathMatch: 'full' }
];
export default routes;