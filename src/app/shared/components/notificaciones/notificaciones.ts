import { Component, inject } from '@angular/core';
import { InvitacionesService } from '../../services/invitaciones.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  clienteId: string = 'cli1';
  private invitacionesService = inject(InvitacionesService);
  invitaciones = this.invitacionesService.obtenerInvitacionesPorCliente(this.clienteId);

  aceptarInvitacion(id?: string) {
    if (!id) return;
    this.invitacionesService.responderInvitacion(id, 'aceptada');
  }

  rechazarInvitacion(id?: string) {
    if (!id) return;
    this.invitacionesService.responderInvitacion(id, 'rechazada');
  }
}
