import { CanActivateFn,Router } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../shared/services/user.service";
import { AuthService } from "../shared/services/auth.service";

export const onlyNotOnboardedGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const user = userService.usuario();

    if (!user) {
        router.navigate(['/auth/login']);
        return false;
    }

    if (user.onboarded) {
        authService.redirectToSection(user);
        return false;
    }

    return true;

}