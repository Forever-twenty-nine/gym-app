import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({
  selector: 'app-dropdown-select',
  imports: [],
  templateUrl: './dropdown-select.html'
})
export class DropdownSelect {
  @Input() label = 'Seleccionar';
  @Input() options: { value: string; label: string }[] = [];
  @Input() value: string = '';
  @Input() placeholder = 'Seleccione...';
  @Output() valueChange = new EventEmitter<string>();

  isOpen = signal(false);

  toggle() {
    this.isOpen.update(open => !open);
  }

  close() {
    this.isOpen.set(false);
  }

  select(val: string) {
    this.value = val;
    this.valueChange.emit(val);
    this.close();
  }

  getLabelForValue(): string {
    return this.options.find(o => o.value === this.value)?.label || this.placeholder;
  }
}
