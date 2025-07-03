import { Component, EventEmitter, Input, Output, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientesService } from '../../../../services/clientes.service';
import { DropdownSelect } from '../../dropdown-select/dropdown-select';
import { DatePicker } from '../../date-picker/date-picker';
import { DatetimePicker } from '../../datetime-picker/datetime-picker';


@Component({
  selector: 'app-table-form',
  imports: [CommonModule, ReactiveFormsModule, DropdownSelect, DatePicker, DatetimePicker],
  templateUrl: './table-form.html'
})
export class TableForm {
  // 🧩 Servicios inyectados
  private clientesService = inject(ClientesService);


  // 📥 Inputs del formulario
  @Input() title: string = 'Formulario';
  @Input() showGuardar = true;
  @Input() showCancelar = true;
  @Input() textGuardar = 'Guardar';
  @Input() textCancelar = 'Cancelar';
  @Input() disableGuardar = false;

  @Input({ required: true }) form!: FormGroup;

  // 📤 Eventos de interacción
  @Output() guardar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();


  // 🔄 Lista dinámica filtrada por cliente
  readonly polizasFiltradas = signal<{ id: string; label: string }[]>([]);

 
  constructor() {
    // ⚡️ Efecto reactivo: actualizar polizasFiltradas cuando cambia el cliente
    effect(() => {
      const clienteId = this.form.get('clienteId')?.value;
      if (!clienteId) return;

     
    
    });
  }

  // 📄 Devuelve representación legible de un valor (ej: nombre de cliente)
  getValorMostrado(nombreCampo: string): string {
    const valor = this.form.get(nombreCampo)?.value;


    return valor ?? '';
  }
  // metodo par hacer dos columnas
  // get camposVisibles(): number {
  //   return this.fields.filter(f => f.type !== 'hidden').length;
  // }

  // get usarDosColumnas(): boolean {
  //   return this.camposVisibles > 5;
  // }
  // // 🔄 Normaliza opciones de campos select
  // getOpcionesNormalizadas(campo: FieldMeta): { label: string; value: string }[] {
  //   if (!campo.options) return [];
  //   return campo.options.map(opt =>
  //     typeof opt === 'string' ? { label: opt, value: opt } : opt
  //   );
  // }


}
