import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
/**
 * Auth Guard para proteger rutas que requieren autenticación.
 * Redirige a la página de login si el usuario no está autenticado.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const usuario = userService.getUsuarioActual();

  console.log('🔐 authGuard:', usuario?.email);

  return userService.estaLogueado() || router.createUrlTree(['/auth/login',{ replaceUrl: true }]);
};
