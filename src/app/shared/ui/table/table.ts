import { Component, Input, Output, EventEmitter, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatearFechaHoraLocal } from '../../../utils/form-utils';
import { ClientesService } from '../../../services/clientes.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
})
export class Table {
  // 🧩 Inyectamos servicios necesarios
  private clientesService = inject(ClientesService);

  // 📥 Entradas: estructura de tabla
  @Input() headers: string[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() fieldTypes: Record<string, string> = {};
  @Input() actions: string[] = [];
  @Input() pageSize = 10;
  @Input() enableSearch = true;
  @Input() showNuevo = false;
  @Input() nuevoLabel = 'Nuevo registro';

  // 📤 Salidas: eventos emitidos al exterior
  @Output() nuevoClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  // 🧠 Estado reactivo interno
  private readonly _rows = signal<any[]>([]);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly hasAnyRow = computed(() => this.rows.length > 0);
  readonly hasVisibleRows = computed(() => this.paginatedRows().length > 0);


  // 🔁 Setter para rows: convierte a signal internamente
  @Input()
  set rows(value: any[]) {
    this._rows.set([...value]); // copia para evitar mutaciones externas
  }
  get rows() {
    return this._rows();
  }

  // ⚡️ Reinicia página al recibir nuevos datos
  constructor() {
    effect(() => {
      this._rows();
      this.currentPage.set(1);
    });
  }

  // 🔎 Filtrado de datos según búsqueda
  readonly filteredRows = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const data = this._rows();
    if (!query) return data;

    return data.filter(row =>
      this.displayedColumns.some(col =>
        String(row[col] ?? '').toLowerCase().includes(query)
      )
    );
  });

  // 📄 Paginación de resultados filtrados
  readonly totalPages = computed(() =>
    Math.ceil(this.filteredRows().length / this.pageSize)
  );

  readonly paginatedRows = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRows().slice(start, start + this.pageSize);
  });

  readonly mostrarPaginacion = computed(() => this.filteredRows().length > this.pageSize);

  // 🎨 Clase dinámica para layout del grid
  readonly gridClass = computed(() => {
    const cols = this.displayedColumns.length + (this.actions.length > 0 ? 1 : 0);
    return {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8'
    }[cols] || 'grid-cols-1';
  });

  // 🧾 Formato personalizado por tipo de campo
  formatValue(value: any, field: string): string {
    const tipo = this.fieldTypes[field];
    if (tipo === 'datetime') return formatearFechaHoraLocal(value);
    return value ?? '—';
  }

  // 🔍 Mapeo especial de algunos campos (como clienteId → nombre)
  getValorFormateado(field: string, value: any): string {
    if (field === 'clienteId') {
      return this.clientesService.getClienteNombrePorId(value) || 'Sin cliente';
    }
    if (field.includes('fecha') || this.fieldTypes[field] === 'datetime') {
      return formatearFechaHoraLocal(value);
    }
    return value ?? '—';
  }

  // 🔁 Cambiar de página
  changePage(delta: number) {
    const next = this.currentPage() + delta;
    if (next >= 1 && next <= this.totalPages()) {
      this.currentPage.set(next);
    }
  }

  // ⚡️ Emitir acciones desde botones
  onAction(action: string, row: any) {
    this.actionClick.emit({ action, row });
  }

  onNuevo() {
    this.nuevoClick.emit();
  }

  // 🔄 Actualizar búsqueda y reiniciar paginado
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  // 🔄 Limpiar búsqueda y reiniciar paginado
  resetSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }
  
}
