import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: 'auth',
        loadChildren: () =>
            import('./auth/auth.routes').then(m => m.default)
    },
    {
        path: 'cliente',
        loadChildren: () =>
            import('./clientes/clientes-routes').then(m => m.default)
    },
    {
        path: 'gimnasio',
        loadChildren: () =>
            import('./gimnasios/gimnasios-routing.module').then(m => m.default)
    },
    {
        path: 'entrenador',
        loadChildren: () =>
            import('./entrenadores/entrenadores-routing.module').then(m => m.default)
    },

];
