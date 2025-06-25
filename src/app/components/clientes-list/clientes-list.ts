import { Component, signal, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteForm } from '../cliente-form/cliente-form';
import { ConfirmarEliminacion } from '../confirmar-eliminacion/confirmar-eliminacion';
import { ClienteDetail } from '../cliente-detail/cliente-detail';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.model';
import { FieldMeta } from '../../models/field-meta.model';
import { CLIENTE_FORM_FIELDS } from '../../utils/utils';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, ClienteForm, ConfirmarEliminacion, ClienteDetail],
  templateUrl: './clientes-list.html',
})
export class ClientesList {
  private readonly servicio = inject(ClientesService);

  readonly cargando = signal(true);
  readonly clientes = this.servicio.clientes;
  readonly fields = signal<FieldMeta<Cliente>[]>(CLIENTE_FORM_FIELDS);
  readonly visibleColumnNames = signal<(keyof Cliente)[]>(['nombre', 'email']);
  readonly visibleFields = computed(() =>
    this.fields().filter(f => this.visibleColumnNames().includes(f.name))
  );

  readonly clienteSeleccionado = signal<Cliente | null>(null);
  readonly clienteAEditar = signal<Cliente | null>(null);
  readonly clienteAEliminar = signal<Cliente | null>(null);

  readonly mostrarDetalle = signal(false);
  readonly mostrarFormulario = signal(false);
  readonly mostrarConfirmacion = signal(false);

  constructor() {
    this.servicio.cargarMock();

    effect(() => {
      if (this.servicio.clientes().length > 0 || !this.cargando()) {
        this.cargando.set(false);
      }
    });

  }

  // 📄 Detalle
  abrirDetalle(cliente: Cliente) {
    this.clienteSeleccionado.set(cliente);
    this.mostrarDetalle.set(true);
  }
  cerrarDetalle() {
    this.mostrarDetalle.set(false);
    this.clienteSeleccionado.set(null);
  }

  // 📝 Formulario
  abrirFormulario(cliente?: Cliente) {
    this.clienteAEditar.set(cliente ? { ...cliente } : { nombre: '', telefono: '', email: '', direccion: '' });
    this.mostrarFormulario.set(true);
  }
  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    setTimeout(() => this.clienteAEditar.set(null), 300);

  }
  guardar(cliente: Cliente) {
    if (cliente.id) {
      this.servicio.actualizar(cliente);
    } else {
      this.servicio.agregar(cliente);
    }
    this.cerrarFormulario();
  }

  // 🗑️ Confirmar eliminación
  confirmarEliminar(cliente: Cliente) {
    this.clienteAEliminar.set(cliente);
    this.mostrarConfirmacion.set(true);
  }
  cancelarEliminacion() {
    this.mostrarConfirmacion.set(false);
    this.clienteAEliminar.set(null);
  }
  eliminarConfirmado() {
    const cliente = this.clienteAEliminar();
    if (cliente?.id) {
      this.servicio.eliminar(cliente.id);
    }
    this.mostrarConfirmacion.set(false);
  }
}
