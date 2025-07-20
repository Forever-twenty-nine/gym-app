import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Welcome } from './welcome/welcome';

export const AUTH_ROUTES: Routes = [
  { path: 'welcome', component: Welcome },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  // { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  // { path: '**', redirectTo: 'welcome' },
];

export default AUTH_ROUTES;
