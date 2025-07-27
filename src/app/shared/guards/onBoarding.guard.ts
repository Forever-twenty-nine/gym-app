import { CanActivateFn,Router } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../services/user.service";

export const onBoardingGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.usuario();

  // Si no hay usuario, redirigir a login
  if (!user) {
    return router.createUrlTree(['/auth/login']);
  }
  // Si el usuario ya completó el onboarding, permitir acceso
  if (user.onboarded) {
    return true;
  }
  // Si no ha completado el onboarding, redirigir a la página de onboarding
  return router.createUrlTree(['/onboarding']);
}