import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmar-eliminacion',
  imports: [],
  templateUrl: './confirmar-eliminacion.html'
})
export class ConfirmarEliminacion {

  @Input() mostrar = false;
  @Input() nombre = '';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

}
