import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalBase } from '../modal-base/modal-base';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'confirmar-eliminacion',
  imports: [ModalBase],
  templateUrl: './confirmar-eliminacion.html'
})
export class ConfirmarEliminacion {

  @Input() cliente!: Cliente;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  @ViewChild(ModalBase) modal!: ModalBase;

  cerrarAnimado() {
    this.modal.cerrarConAnimacion();
  }

  onCerrar() {
    this.cancelar.emit();
  }

}
