import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Rol } from '../enums/rol.enum';
import { hasRol } from '../helpers/rol.helpers';

/**
 * 🛡️ Guard que protege rutas según roles requeridos
 *
 * - 🔐 Si no hay usuario logueado (según señal del servicio), redirige a `/auth/login`
 * - 🚫 Si el usuario no tiene ninguno de los roles requeridos, redirige a `/onboarding`
 * - ✅ Si el usuario cumple con algún rol permitido, se le permite el acceso
 *
 * @param allowedRoles Lista de roles válidos para acceder a la ruta
 * @returns `true` si tiene permiso o un `UrlTree` si debe redirigir
 */
export const roleGuard =
  (allowedRoles: Rol[]): CanActivateFn =>
    () => {
      const userService = inject(UserService);
      const router = inject(Router);

      // 📦 Obtenemos el usuario actual desde la señal reactiva
      const user = userService.usuario();

      // 🔐 No hay usuario → redirige a login
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      // ✅ Si tiene al menos uno de los roles requeridos
      const tieneRolPermitido = allowedRoles.some(rol => hasRol(user, rol));

      // 🚫 Usuario autenticado pero sin roles permitidos → onboarding
      if (!tieneRolPermitido) {
        return router.createUrlTree(['/onboarding']);
      }

      // ✅ Usuario válido y autorizado
      return true;
    };
