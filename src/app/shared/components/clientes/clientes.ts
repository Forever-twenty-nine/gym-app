
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  imports: [CommonModule, FormsModule]
})
export class Clientes {

  mostrarModalInvitacion = false;
  private clienteService = inject(ClienteService);

  gimnasioId = signal('');

  clientes = computed(() =>
    this.gimnasioId() ? this.clienteService.clientesPorGimnasio(this.gimnasioId())() : []
  );
  loading = this.clienteService.loading;
  error = this.clienteService.error;

  emailInvitacion = signal('');

  desasociarCliente(id: string) {
    this.clienteService.desasociarCliente(id);
  }
}
