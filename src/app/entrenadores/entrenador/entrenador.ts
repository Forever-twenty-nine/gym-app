import { Component } from '@angular/core';
import { inject, computed } from '@angular/core';
import { EjercicioService } from '../../shared/services/ejercicio.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-entrenador',
  imports: [RouterModule],
  templateUrl: './entrenador.html'
})
export class Entrenador {

  public ejercicioService = inject(EjercicioService);

  // Indicadores y estadísticas globales
  totalEjercicios = computed(() => this.ejercicioService.ejercicios().length);
  ejerciciosConPeso = computed(() => this.ejercicioService.ejerciciosConPeso().length);
  ejerciciosSinPeso = computed(() => this.ejercicioService.ejerciciosSinPeso().length);
  estadisticas = this.ejercicioService.estadisticasEjercicios;

}
