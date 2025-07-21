import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Welcome } from './welcome/welcome';

export const AuthRoutes: Routes = [
  
  // 1️⃣ Redirige la ruta vacía de /auth a /auth/welcome
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },

  // 2️⃣ Componentes standalone con changeDetection OnPush
  { path: 'welcome', component: Welcome },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },

  // 3️⃣ Wildcard interno de auth: si mete algo raro en /auth/xxx → welcome
  { path: '**', redirectTo: 'welcome' }
];
