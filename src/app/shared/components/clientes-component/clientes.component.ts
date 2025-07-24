
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes-component',
  standalone: true,
  templateUrl: './clientes.component.html',
  imports: [CommonModule, FormsModule]
})
export class ClientesComponent {
  mostrarModalInvitacion = false;
  private clientesService = inject(ClientesService);

  gimnasioId = signal('');

  clientes = computed(() =>
    this.gimnasioId() ? this.clientesService.clientesPorGimnasio(this.gimnasioId())() : []
  );
  loading = this.clientesService.loading;
  error = this.clientesService.error;

  emailInvitacion = signal('');


  enviarInvitacion() {
    if (this.emailInvitacion() && this.gimnasioId()) {
      this.clientesService.enviarInvitacion(this.emailInvitacion(), this.gimnasioId());
      this.emailInvitacion.set('');
    }
  }

  desasociarCliente(id: string) {
    this.clientesService.desasociarCliente(id);
  }
}
