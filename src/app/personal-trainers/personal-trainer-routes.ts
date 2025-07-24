import { Routes } from '@angular/router';
import { PersonalTrainer } from './personal-trainer/personal-trainer';
import { ClientesComponent } from '../shared/components/clientes-component/clientes.component';
import { Rutinas } from '../shared/components/rutinas/rutinas';
import { Ejercicios } from '../shared/components/ejercicios/ejercicios';
import { Invitaciones } from '../shared/components/invitaciones/invitaciones';


const routes: Routes = [
  { path: '', component: PersonalTrainer },
  { path: 'clientes', component: ClientesComponent },
  { path: 'rutinas', component: Rutinas },
  { path: 'ejercicios', component: Ejercicios },
  { path: 'invitaciones', component: Invitaciones }
];
export default routes;