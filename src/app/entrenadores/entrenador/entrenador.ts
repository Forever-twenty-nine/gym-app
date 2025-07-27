import { Component } from '@angular/core';
import { inject, computed } from '@angular/core';
import { EjercicioService } from '../../shared/services/ejercicio.service';
import { RouterModule } from '@angular/router';
import { IonBadge, IonContent, IonHeader, IonIcon } from "@ionic/angular/standalone";
import { AuthService } from '../../shared/services/auth.service';
import { NgOptimizedImage } from '@angular/common';



@Component({
  selector: 'app-entrenador',
  imports: [RouterModule, IonContent,IonHeader,IonIcon,IonBadge,NgOptimizedImage],
  templateUrl: './entrenador.html'
})
export class Entrenador {

  public ejercicioService = inject(EjercicioService);

  // Indicadores y estadísticas globales
  totalEjercicios = computed(() => this.ejercicioService.ejercicios().length);
  ejerciciosConPeso = computed(() => this.ejercicioService.ejerciciosConPeso().length);
  ejerciciosSinPeso = computed(() => this.ejercicioService.ejerciciosSinPeso().length);
  estadisticas = this.ejercicioService.estadisticasEjercicios;


   private authService: AuthService = inject(AuthService);
  
    cerrarSesion() {
      this.authService.logout();
  
    }

}
