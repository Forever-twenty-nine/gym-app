import { Component, computed, EventEmitter, Input, Output, signal, HostListener } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { FieldMeta } from '../../models/field-meta.model';
import { CLIENTE_FORM_FIELDS } from '../../utils/utils';

@Component({
  selector: 'app-cliente-detail',
  imports: [],
  templateUrl: './cliente-detail.html'
})
export class ClienteDetail {
  private _mostrar = signal(false);
  @Input()
  set mostrar(valor: boolean) {
    this._mostrar.set(valor);
  }
  get mostrar() {
    return this._mostrar();
  }

  @Input() cliente: Cliente | null = null;
  @Output() cerrar = new EventEmitter<void>();

  readonly campos = signal<FieldMeta<Cliente>[]>(CLIENTE_FORM_FIELDS);
  readonly cerrando = signal(false);
  readonly visible = computed(() => this.mostrar || this.cerrando());

  cerrarModal() {
    this.cerrando.set(true);
    setTimeout(() => {
      this.cerrando.set(false);
      this.cerrar.emit();
    }, 200);
  }

  leerCampo(nombre: keyof Cliente): string {
    return this.cliente?.[nombre] ?? '—';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.mostrar && !this.cerrando()) {
      this.cerrarModal();
    }
  }

}
