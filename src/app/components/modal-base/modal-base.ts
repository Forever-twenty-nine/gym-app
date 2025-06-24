import { Component, computed, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'modal-base',
  imports: [],
  templateUrl: './modal-base.html'
})
export class ModalBase {

  @Output() cerrar = new EventEmitter<void>();

  readonly cerrando = signal(false);

  cerrarConAnimacion() {
    this.cerrando.set(true);
    setTimeout(() => {
      this.cerrando.set(false);
      this.cerrar.emit();
    }, 300);
  }

  @HostListener('document:keydown', ['$event'])
  cerrarConEsc(event: KeyboardEvent) {
    if (event.key === 'Escape' && !this.cerrando()) {
      this.cerrarConAnimacion();
    }
  }

}
