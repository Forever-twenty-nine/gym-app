import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UserService } from '../../services/user.service';
import { Rol } from '../../enums/rol.enum';


/** 🔔 Componente que muestra notificaciones de invitaciones */
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  /** 📩 Invitaciones pendientes (signal reactiva) */
  readonly invitaciones = this.notificacionesService.invitaciones;

  /** 🧠 Email y tipo del usuario actual (computed) */
  readonly emailUsuario = computed(() => this.userService.getUsuarioActual()?.email ?? '');
  readonly tipoUsuario = computed<'cliente' | 'entrenador'>(() => {
    const roles = this.userService.getUsuarioActual()?.roles ?? [];
    if (roles.includes(Rol.CLIENTE)) return 'cliente';

    return 'entrenador';
  });

  constructor() {
    // 🔁 Escucha invitaciones al cargar y limpia automáticamente
    effect(() => {
      const email = this.emailUsuario();
      const tipo = this.tipoUsuario();

      if (email && tipo) {
        this.notificacionesService.escucharInvitaciones(email, tipo);
      }

      return () => {
        this.notificacionesService.limpiar();
      };
    });

  }

  /** ✅ Aceptar invitación */
  async aceptarInvitacion(invitacion: any) {
    await this.notificacionesService.responderInvitacion(invitacion, 'aceptada');
  }

  /** ❌ Rechazar invitación */
  async rechazarInvitacion(invitacion: any) {
    await this.notificacionesService.responderInvitacion(invitacion, 'rechazada');
  }
}
