import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';
import { ForgotPassword } from './forgot-password/forgot-password';

export const AUTH_ROUTES: Routes = [
    { path: 'login', component: LoginPage },
    { path: 'register', component: RegisterPage },
    { path: 'forgot-password', component: ForgotPassword },
    { path: '**', redirectTo: 'login' }
];
