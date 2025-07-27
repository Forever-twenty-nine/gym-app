import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitacionService } from '../../services/invitacion.service';
import { ToDatePipe } from '../../pipes/to-date.pipe';
import { UserService } from '../../services/user.service';
import { Permiso } from '../../enums/permiso.enum';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-invitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ToDatePipe],
  templateUrl: './invitaciones.html'
})

export class Invitaciones {
  email = '';

  invitacionService = inject(InvitacionService);
  userService = inject(UserService);
  toast = inject(ToastService);

  permisoGestionarClientes = this.userService.tienePermiso(Permiso.GESTIONAR_CLIENTES);
  permisoGestionarEntrenadores = this.userService.tienePermiso(Permiso.GESTIONAR_ENTRENADORES);

  // Signals para las invitaciones pendientes y aceptadas
  invitacionesPendientes = this.invitacionService.listarInvitacionesPorEstado('pendiente');
  invitacionesAceptadas = this.invitacionService.listarInvitacionesPorEstado('aceptada');

  /**
   * Método unificado para enviar invitaciones a clientes o entrenadores
   * @param tipo 'cliente' | 'entrenador'
   */
  async enviarInvitacion(tipo: 'cliente' | 'entrenador') {
    let invitadorId: string | null = null;
    if (tipo === 'cliente') {
      invitadorId = this.userService.idInvitador();
    } else if (tipo === 'entrenador') {
      invitadorId = this.userService.gimnasioId();
    }
    if (!invitadorId) {
      this.toast.show('❌ No se pudo determinar el ID del invitador', 'error');
      return;
    }
    const result = await this.invitacionService.enviarInvitacion({
      email: this.email,
      invitadorId,
      tipo
    });
    if (result.success) {
      this.toast.show(`✅ Invitación enviada correctamente`, 'success');
      this.email = '';
    } else {
      this.toast.show('❌ Error al enviar invitación: ' + (result.error ?? 'Error desconocido'), 'error');
    }
  }
    
}
