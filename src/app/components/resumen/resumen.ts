import { Component, computed, inject } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { DonutChart } from '../donut-chart/donut-chart';

@Component({
  selector: 'app-resumen',
  imports: [DonutChart],
  templateUrl: './resumen.html',
})
export class Resumen {
  
  private servicio = inject(ClientesService);
  
  private clientes = this.servicio.clientes;
 
  // 📌 Total de clientes
  total = computed(() => this.clientes().length);
  

  // 📧 Cantidad de dominios únicos de email
  dominios = computed(() => {
    const dominiosSet = new Set(
      this.clientes().map(c => c.email.split('@')[1].toLowerCase())
    );
    return dominiosSet.size;
  });

  // 🔠 Clientes por inicial de nombre
  porInicial = computed(() => {
    const mapa = new Map<string, number>();
    for (const c of this.clientes()) {
      const letra = c.nombre.charAt(0).toUpperCase();
      mapa.set(letra, (mapa.get(letra) || 0) + 1);
    }
    return Array.from(mapa.entries()).sort();
  });

  porEstado = computed(() => {
    const mapa = new Map<string, number>();
    for (const c of this.clientes()) {
      mapa.set(c.estado, (mapa.get(c.estado) || 0) + 1);
    }
    return Array.from(mapa.entries());
  });

  porEstadoData = computed(() =>
    this.porEstado().map(([estado, cantidad]) => ({
      label: estado,
      count: cantidad,
      color:
        estado === 'prospecto' ? '#3b82f6' :
          estado === 'presupuesto' ? '#eab308' :
            estado === 'cliente' ? '#22c55e' :
              '#9ca3af' // gris por defecto
    }))
  );
  
  
  claseBarraEstado(estado: string): string {
    const base = 'h-2 rounded-full transition-all';
    switch (estado) {
      case 'prospecto':
        return `${base} bg-blue-500`;
      case 'presupuesto':
        return `${base} bg-yellow-500`;
      case 'cliente':
        return `${base} bg-green-500`;
      default:
        return `${base} bg-gray-400`;
    }
  }
  

}
