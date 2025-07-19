import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { Rol } from '../shared/enums/rol.enum';

export const roleGuard =
  (allowedRoles: Rol[]): CanActivateFn =>
    () => {
      const userService = inject(UserService);
      const router = inject(Router);

      const user = userService.usuario();

      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      if (!allowedRoles.includes(user.rol)) {
        router.navigate(['/onboarding']);
        return false;
      }

      return true;
    };
