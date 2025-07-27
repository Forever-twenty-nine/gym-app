
import {  Routes } from '@angular/router';
import { Gimnasio } from './gimnasio/gimnasio';
import { EntrenadoresGimnasio } from './entrenadores-gimnasio/entrenadores-gimnasio';
import { Clientes } from '../shared/components/clientes/clientes';
import { Invitaciones } from '../shared/components/invitaciones/invitaciones';

import { Layout } from '../layout/layout';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'inicio', component: Gimnasio },
      { path: 'clientes', component: Clientes },
      { path: 'entrenadores', component: EntrenadoresGimnasio },
      { path: 'invitaciones', component: Invitaciones },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  }
];

export default routes;