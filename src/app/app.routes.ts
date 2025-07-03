import { Routes } from '@angular/router';
import { ClientesList } from './components/clientes-list/clientes-list';
import { Resumen } from './components/resumen/resumen';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () =>
            import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {path: '', redirectTo: 'clientes', pathMatch: 'full'},
    {path: 'clientes', component: ClientesList},
    {path: 'resumen', component: Resumen}
    
];
