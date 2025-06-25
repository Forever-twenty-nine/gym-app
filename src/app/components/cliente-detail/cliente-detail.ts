import { Component, computed, EventEmitter, Input, Output, signal, HostListener, ViewChild } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { FieldMeta } from '../../models/field-meta.model';
import { CLIENTE_FORM_FIELDS } from '../../utils/utils';
import { ModalBase } from '../modal-base/modal-base';

@Component({
  selector: 'cliente-detail',
  imports: [ModalBase],
  templateUrl: './cliente-detail.html'
})
export class ClienteDetail {

  @Input() cliente: Cliente | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @ViewChild(ModalBase) modal!: ModalBase;

  readonly campos = signal<FieldMeta<Cliente>[]>(CLIENTE_FORM_FIELDS);

  leerCampo(nombre: keyof Cliente): string {
    return this.cliente?.[nombre] ?? '—';
  }

  onCerrar() {
    this.modal.cerrarConAnimacion();
  }

}
