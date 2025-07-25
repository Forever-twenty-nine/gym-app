import { CanActivateFn,Router } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";

export const onlyNotOnboardedGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const user = userService.usuario();
    // Si no hay usuario, redirige al login
    if (!user) {
        router.navigate(['/auth/login']);
        return false;
    }
    // Si el usuario ya está onboarded, redirige a la sección correspondiente
    if (user.onboarded) {
        authService.redirectToSection(user);
        return false;
    }
    // Si el usuario no está onboarded, permite el acceso a la ruta de onboarding
    return true;

}