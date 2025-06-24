import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';
import { CLIENTE_FORM_FIELDS } from '../../utils/utils';
import { ModalBase } from '../modal-base/modal-base';

@Component({
  selector: 'cliente-form',
  imports: [ReactiveFormsModule, ModalBase],
  templateUrl: './cliente-form.html',
})
export class ClienteForm implements OnInit {

  @Input() cliente!: Cliente;
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

  intentoGuardar = false;

  guardar() {
    this.intentoGuardar = true;
    if (this.form.valid) {
      this.guardarCliente.emit({ ...this.cliente, ...this.form.value });
    } else {
      this.form.markAllAsTouched();
    }
  }

  campoInvalido(nombre: string): boolean {
    const control = this.form.get(nombre);
    return !!(control && control.invalid && (control.touched || this.intentoGuardar));
  }


  errorKeys(nombre: keyof Cliente): string[] {
    const control = this.form.get(nombre as string);
    return control && control.errors ? Object.keys(control.errors) : [];
  }
  
  @ViewChild(ModalBase) modal!: ModalBase;

  cerrarAnimado() {
    this.modal.cerrarConAnimacion();
  }

  onCerrar() {
    this.cancelar.emit(); // esto se llama tras animación
  }
}
