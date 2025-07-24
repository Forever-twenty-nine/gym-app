import { Component, inject, computed } from '@angular/core';
import { InvitacionesService } from '../../services/invitaciones.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  // Simula el email del usuario actual
  emailUsuario: string = 'usuario@email.com';
  tipo: 'cliente' | 'entrenador' = 'cliente'; // Cambia según el tipo de usuario

  private invitacionesService = inject(InvitacionesService);

  invitaciones = computed(() => this.invitacionesService.invitacionesPorEmail(this.emailUsuario, this.tipo)());

  async aceptarInvitacion(id?: string) {
    if (!id) return;
    await this.invitacionesService.responderInvitacion(id, 'aceptada');
  }

  async rechazarInvitacion(id?: string) {
    if (!id) return;
    await this.invitacionesService.responderInvitacion(id, 'rechazada');
  }
}
