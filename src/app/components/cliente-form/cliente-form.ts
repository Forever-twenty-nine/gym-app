import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';
import { CLIENTE_FORM_FIELDS } from '../../utils/utils';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-form.html',
})
export class ClienteForm implements OnInit {
  @Input() cliente!: Cliente;
  @Input() mostrar!: boolean;
  @Output() guardarCliente = new EventEmitter<Cliente>();
  @Output() cancelar = new EventEmitter<void>();

  form!: FormGroup;
  campos = CLIENTE_FORM_FIELDS;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    const grupo: Record<string, any> = {};
    this.campos.forEach(({ name, validators }) => {
      grupo[name] = [this.cliente?.[name] || '', validators || []];
    });
    this.form = this.fb.group(grupo);
  }

  guardar() {
    if (this.form.valid) {
      this.guardarCliente.emit({ ...this.cliente, ...this.form.value });
    } else {
      this.form.markAllAsTouched();
    }
  }

  campoInvalido(nombre: string): boolean {
    const control = this.form.get(nombre);
    return !!(control && control.invalid && control.touched);
  }

  errorKeys(nombre: keyof Cliente): string[] {
    const control = this.form.get(nombre);
    return control && control.invalid && (control.dirty || control.touched)
      ? Object.keys(control.errors ?? {})
      : [];
  }
  
}
