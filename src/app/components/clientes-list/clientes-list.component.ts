import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.model';
import { signal } from '@angular/core';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent {

  cargando = signal(true);
  

  private clientesService = inject(ClientesService);

  constructor(private servicio: ClientesService) {
    effect(() => {
      const lista = this.servicio.clientes();
      if (lista.length > 0 || !this.cargando()) {
        this.cargando.set(false); // cuando hay datos o ya pasó un ciclo, apagamos el spinner
      }
    });
  }

  mostrarModal = false;
  cliente: Cliente = { nombre: '', telefono: '', email: '', direccion: '' };

  readonly clientes = this.clientesService.clientes;

  abrirModal() {
    this.mostrarModal = true;
    this.cliente = { nombre: '', telefono: '', email: '', direccion: '' };
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cliente = { nombre: '', telefono: '', email: '', direccion: '' };
  }

  async guardar() {
    const { id, nombre, telefono, email, direccion } = this.cliente;
    if (nombre && telefono && email && direccion) {
      if (id) {
        await this.clientesService.actualizar(this.cliente);
      } else {
        await this.clientesService.agregar({ nombre, telefono, email, direccion });
      }
      this.cerrarModal();
    }
  }

  eliminar(id?: string) {
    if (!id) return;
    this.clientesService.eliminar(id);
  }


  editar(cliente: Cliente) {
    this.cliente = { ...cliente };
    this.mostrarModal = true;
  }
}
