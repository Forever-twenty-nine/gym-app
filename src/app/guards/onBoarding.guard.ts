import { CanActivateFn,Router } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../shared/services/user.service";

export const onBoardingGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.usuario();

  // Si no hay usuario, redirigir a login
  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Si el usuario ya completó el onboarding, permitir acceso
  if (user.onboarded) {
    return true;
  }

  // Si no ha completado el onboarding, redirigir a la página de onboarding
  router.navigate(['/onboarding']);
  return false;
}