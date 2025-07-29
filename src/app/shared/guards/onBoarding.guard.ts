import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../services/user.service";
/**
  * Guard para proteger rutas que requieren que el usuario haya completado el onboarding.
  * Redirige a la página de onboarding si el usuario no ha completado el proceso.
  */
export const onBoardingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);
  const usuario = userService.getUsuarioActual();

  console.log("🔐 onBoardingGuard:", usuario?.onboarded);

  if (!usuario) return router.navigateByUrl('/auth/login', { replaceUrl: true });
  if (!usuario.onboarded) return router.navigateByUrl('/onboarding', { replaceUrl: true });

  return true;
}