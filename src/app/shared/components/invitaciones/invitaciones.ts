import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitacionesService } from '../../services/invitaciones.service';

@Component({
  selector: 'app-invitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitaciones.html'
})

export class Invitaciones {
  emailCliente = '';
  emailEntrenador = '';
  permisosUsuario: string[] = ['gestionar_usuarios'];
  gimnasioId = 'gim1'; 

  invitacionesService = inject(InvitacionesService);

  async enviarInvitacionCliente() {
    await this.invitacionesService.enviarInvitacion(
      { email: this.emailCliente, gimnasioId: this.gimnasioId, tipo: 'cliente' },
      this.permisosUsuario
    );
    this.emailCliente = '';
  }

  async enviarInvitacionEntrenador() {
    await this.invitacionesService.enviarInvitacion(
      { email: this.emailEntrenador, gimnasioId: this.gimnasioId, tipo: 'entrenador' },
      this.permisosUsuario
    );
    this.emailEntrenador = '';
  }
}
