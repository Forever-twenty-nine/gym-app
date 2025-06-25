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
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  @ViewChild(ModalBase) modal!: ModalBase;

  onCerrar() {
    this.modal.cerrarConAnimacion(() => this.cerrar.emit());
  }
  onEliminar() {
    this.modal.cerrarConAnimacion(() => this.confirmar.emit());
  }


}
