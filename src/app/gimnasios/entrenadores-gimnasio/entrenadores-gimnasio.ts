import { Component, inject } from '@angular/core';
import { GimnasioService } from '../../shared/services/gimnasio.service';

@Component({
  selector: 'app-entrenadores-gimnasio',
  templateUrl: './entrenadores-gimnasio.html',
  standalone: true,
  imports: []
})
export class EntrenadoresGimnasio {
  entrenadores: Array<{ id: string; nombre: string; email: string }> = [];
  private gimnasioService = inject(GimnasioService);
  gimnasioId = 'gim1'; // Reemplaza por el id real del gimnasio

  constructor() {
    this.cargarEntrenadores();
  }

  async cargarEntrenadores() {
    this.entrenadores = await this.gimnasioService.getEntrenadoresPorGimnasio(this.gimnasioId);
  }
}
