import { CanActivateFn,Router } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";

// Guard eliminado: la lógica se unifica en onBoardingGuard