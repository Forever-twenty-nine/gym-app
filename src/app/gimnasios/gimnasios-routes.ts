
import {  Routes } from '@angular/router';
import { Gimnasio } from './gimnasio/gimnasio';
import { EntrenadoresGimnasio } from './entrenadores-gimnasio/entrenadores-gimnasio';
import { Clientes } from '../shared/components/clientes/clientes';
import { Invitaciones } from '../shared/components/invitaciones/invitaciones';

const routes: Routes = [
  { path: '', component: Gimnasio },
  { path: 'clientes', component: Clientes },
  { path: 'entrenadores', component: EntrenadoresGimnasio},
  { path: 'invitaciones', component: Invitaciones }
];

export default routes;