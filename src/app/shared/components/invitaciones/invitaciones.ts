import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitacionesService } from '../../services/invitaciones.service';
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
  emailCliente = '';
  emailEntrenador = '';

  invitacionesService = inject(InvitacionesService);
  userService = inject(UserService);
  toast = inject(ToastService);

  permisoGestionarClientes = this.userService.tienePermiso(Permiso.GESTIONAR_CLIENTES);
  permisoGestionarEntrenadores = this.userService.tienePermiso(Permiso.GESTIONAR_ENTRENADORES);

  // Signals para las invitaciones pendientes y aceptadas
  invitacionesPendientes = toSignal(this.invitacionesService.listarInvitacionesPorEstado('pendiente'), { initialValue: [] });
  invitacionesAceptadas = toSignal(this.invitacionesService.listarInvitacionesPorEstado('aceptada'), { initialValue: [] });

  async enviarInvitacionCliente() {
    const invitadorId = this.userService.idInvitador();
    if (!invitadorId) {
      this.toast.show('❌ No se pudo determinar el ID del invitador', 'error');
      return;
    }

    await this.invitacionesService.enviarInvitacion({
      email: this.emailCliente,
      invitadorId: invitadorId,
      tipo: 'cliente'
    });

    this.emailCliente = '';
  }

  async enviarInvitacionEntrenador() {
    const gimnasioId = this.userService.gimnasioId();
    if (!gimnasioId) {
      this.toast.show('❌ No se pudo determinar el ID del gimnasio', 'error');
      return;
    }

    await this.invitacionesService.enviarInvitacion({
      email: this.emailEntrenador,
      invitadorId: gimnasioId,
      tipo: 'entrenador'
    });

    this.emailEntrenador = '';
  }
}
