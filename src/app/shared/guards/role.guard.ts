import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Rol } from '../enums/rol.enum';
import { hasRol } from '../helpers/rol.helpers';

export const roleGuard =
  (allowedRoles: Rol[]): CanActivateFn =>
    () => {
      const userService = inject(UserService);
      const router = inject(Router);

      const user = userService.usuario();

      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      const tieneRolPermitido = allowedRoles.some(rol => hasRol(user, rol));
      if (!tieneRolPermitido) {
        return router.createUrlTree(['/onboarding']);
      }

      return true;
    };
