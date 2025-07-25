import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitacionesService } from '../../services/invitaciones.service';
import { UserService } from '../../services/user.service';
import { Permiso } from '../../enums/permiso.enum';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-invitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
