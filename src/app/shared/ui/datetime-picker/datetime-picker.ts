import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-datetime-picker',
  templateUrl: './datetime-picker.html'
})
export class DatetimePicker {
  @Input() label: string = 'Fecha y hora';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}
