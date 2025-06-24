import { Component, signal, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteForm } from '../cliente-form/cliente-form';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.model';
import { ConfirmarEliminacion } from '../confirmar-eliminacion/confirmar-eliminacion';
// Importa los módulos necesarios y los componentes que se usarán en la plantilla
import { FieldMeta } from '../../models/field-meta.model';
import { CLIENTE_FORM_FIELDS } from '../../utils/utils';
import { ClienteDetail } from '../cliente-detail/cliente-detail';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, ClienteForm, ConfirmarEliminacion, ClienteDetail],
  templateUrl: './clientes-list.html',
})
export class ClientesList {
  cargando = signal(true);
  private readonly servicio = inject(ClientesService);
  readonly clientes = this.servicio.clientes;

  readonly fields = signal<FieldMeta<Cliente>[]>(CLIENTE_FORM_FIELDS);

  readonly visibleColumnNames = signal<(keyof Cliente)[]>([
    'nombre',
    'email',
  ]);

  readonly visibleFields = computed(() =>
    this.fields().filter(f => this.visibleColumnNames().includes(f.name))
  );

  readonly modalDetalleActivo = signal(false);
  readonly clienteSeleccionado = signal<Cliente | null>(null);

  abrirDetalle(cliente: Cliente) {
    this.clienteSeleccionado.set(cliente);
    this.modalDetalleActivo.set(true);
  }

  cerrarDetalle() {
    this.modalDetalleActivo.set(false);
  }

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
