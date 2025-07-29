import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { Rol } from '../enums/rol.enum';
import { hasRol } from '../helpers/rol.helpers';

/**
 * 🎯 RoleGuard
 * Redirige a /onboarding si no tiene alguno de los roles esperados.
 */
export const roleGuard = (allowedRoles: Rol[]): CanActivateFn => () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const usuario = userService.getUsuarioActual();

  const tieneRol = allowedRoles.some(rol => usuario?.roles.includes(rol));

  console.log('🎯 roleGuard:',  usuario?.roles );

  if (!usuario) return router.navigateByUrl('/auth/login', { replaceUrl: true });
  return tieneRol ? true : router.navigateByUrl('/onboarding', { replaceUrl: true });
};

