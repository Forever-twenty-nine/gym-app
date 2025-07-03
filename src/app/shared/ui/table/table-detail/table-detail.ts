import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../services/clientes.service';
import { PolizasService } from '../../../services/polizas.service';
import {
  getLabelFromFields,
  camposCliente,
  camposPoliza,
  camposSiniestro,
  camposAlerta,
  camposAseguradora
} from '../../../utils/form-utils';

@Component({
  selector: 'app-table-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-detail.html'
})
export class TableDetail {
  // 📥 Entradas del componente
  @Input({ required: true }) item!: Record<string, any>;
  @Input() title: string = 'Detalle';
  @Input() entity: 'cliente' | 'poliza' | 'siniestro' | 'alerta' | 'aseguradora' = 'cliente';

  // 📤 Salida al cerrar
  @Output() cerrar = new EventEmitter<void>();

  // 🧩 Servicios para formateo de relaciones
  private clientesService = inject(ClientesService);
  private polizasService = inject(PolizasService);

  // 🧠 Computado: campos visibles según entidad y metadatos
  readonly itemKeys = computed(() => {
    if (!this.item) return [];

    const campos = {
      cliente: camposCliente,
      poliza: camposPoliza,
      siniestro: camposSiniestro,
      alerta: camposAlerta,
      aseguradora: camposAseguradora
    }[this.entity];

    return Object.keys(this.item).filter(k => {
      if (k === 'id') return false;
      const meta = campos?.find(f => f.name === k);
      return meta?.type !== 'hidden';
    });
  });

  // 🧾 Formatea valores especiales: relaciones y fechas
  getValorFormateado(key: string, value: any): string {
    if (key === 'clienteId') {
      const nombre = this.clientesService.getClienteNombrePorId(value);
      return nombre || 'Sin cliente asignado';
    }

    if (key === 'polizaId') {
      const poliza = this.polizasService.getPolizaById?.(value);
      return poliza ? (poliza.numero ?? poliza.tipoSeguro ?? poliza.id ?? 'Sin póliza') : 'Sin póliza';
    }

    if (value instanceof Date) {
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(value);
    }

    return value ?? '—';
  }

  // 🏷 Obtiene la etiqueta legible de cada campo
  getLabel(key: string): string {
    const camposMap = {
      cliente: camposCliente,
      poliza: camposPoliza,
      siniestro: camposSiniestro,
      alerta: camposAlerta,
      aseguradora: camposAseguradora // ⚠️ Reemplazado (antes usabas camposAlerta por error)
    };

    return getLabelFromFields(camposMap[this.entity], key) ?? key;
  }
}
