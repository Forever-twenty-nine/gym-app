import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteForm } from '../cliente-form/cliente-form';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.model';
import { ConfirmarEliminacion } from '../confirmar-eliminacion/confirmar-eliminacion';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, ClienteForm ,ConfirmarEliminacion],
  templateUrl: './clientes-list.html',
})
export class ClientesList {
  cargando = signal(true);
  private readonly servicio = inject(ClientesService);
  readonly clientes = this.servicio.clientes;

  clienteAEliminar = signal<Cliente | null>(null);
  mostrarConfirmar = signal(false);
  mostrarModal = signal(false);
  
  cliente = signal<Cliente>({ nombre: '', telefono: '', email: '', direccion: '' });

  constructor() {
    this.servicio.cargarMock();

    effect(() => {
      const lista = this.servicio.clientes();
      if (lista.length > 0 || !this.cargando()) {
        this.cargando.set(false);
      }
    });
  }

  abrirModal() {
    this.mostrarModal.set(true);
    this.cliente.set({ nombre: '', telefono: '', email: '', direccion: '' });
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  guardar(cliente: Cliente) {
    if (cliente.id) {
      this.servicio.actualizar(cliente);
    } else {
      this.servicio.agregar(cliente);
    }
    this.cerrarModal();
  }

  eliminar(cliente: Cliente) {
    this.clienteAEliminar.set(cliente);
    this.mostrarConfirmar.set(true);
  }

  confirmarEliminacion() {
    const cliente = this.clienteAEliminar();
    if (cliente?.id) {
      this.servicio.eliminar(cliente.id);
    }
    this.mostrarConfirmar.set(false);
  }

  editar(cliente: Cliente) {
    this.cliente.set({ ...cliente });
    this.mostrarModal.set(true);
  }
}
