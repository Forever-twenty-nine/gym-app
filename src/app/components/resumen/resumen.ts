import { Component, computed, inject } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-resumen',
  imports: [],
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

}
