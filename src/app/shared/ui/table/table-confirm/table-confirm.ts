import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-confirm',
  imports: [CommonModule],
  templateUrl: './table-confirm.html'
})
export class TableConfirm {

  @Input() title = 'Confirmar acción';
  @Input() message = '¿Está seguro de continuar?';
  @Input() textCancelar = 'Cancelar';
  @Input() textConfirmar = 'Confirmar';

  @Output() cancelar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

}
