
import {  Routes } from '@angular/router';
import { Gimnasio } from './gimnasio/gimnasio';
import { EntrenadoresGimnasio } from './entrenadores-gimnasio/entrenadores-gimnasio';
import { ClientesComponent } from '../shared/components/clientes-component/clientes.component';
import { Invitaciones } from '../shared/components/invitaciones/invitaciones';

const routes: Routes = [
  { path: '', component: Gimnasio },
  { path: 'clientes', component: ClientesComponent },
  { path: 'entrenadores', component: EntrenadoresGimnasio},
  { path: 'invitaciones', component: Invitaciones }
];

export default routes;