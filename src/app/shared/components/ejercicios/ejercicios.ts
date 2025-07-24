import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioRutina } from '../../models/ejercicio.model';

@Component({
  selector: 'app-ejercicios',
  imports: [FormsModule],
  templateUrl: './ejercicios.html'
})
export class Ejercicios implements OnInit, OnDestroy {

  public ejercicioService = inject(EjercicioService);
  
  // Signals del componente
  mostrarFormulario = signal<boolean>(false);
  ejercicioEditando = signal<EjercicioRutina | null>(null);
  filtroActivo = signal<string>('todos'); // 'todos', 'conPeso', 'sinPeso'
  busquedaNombre = signal<string>('');
  
  // Datos del formulario
  nombre = signal<string>('');
  descripcion = signal<string>('');
  series = signal<number>(3);
  repeticiones = signal<number>(10);
  peso = signal<number>(0);
  descansoSegundos = signal<number>(60);
  
  // Listeners de búsqueda
  private busquedaListener?: ReturnType<typeof this.ejercicioService.buscarEjerciciosPorNombre>;
  
  // Signals computados para ejercicios filtrados
  ejerciciosFiltrados = computed(() => {
    const ejercicios = this.ejercicioService.ejercicios();
    const filtro = this.filtroActivo();
    const busqueda = this.busquedaNombre().trim().toLowerCase();

    let resultado = ejercicios;

    // Filtrar por nombre si hay búsqueda
    if (busqueda) {
      resultado = resultado.filter(ejercicio => 
        ejercicio.nombre.toLowerCase().includes(busqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(busqueda))
      );
    }

    // Filtrar por categoría
    switch (filtro) {
      case 'conPeso':
        resultado = resultado.filter(e => e.peso && e.peso > 0);
        break;
      case 'sinPeso':
        resultado = resultado.filter(e => !e.peso || e.peso === 0);
        break;
      // 'todos' no necesita filtro adicional
    }

    return resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  // Signals computados para estadísticas
  totalEjercicios = computed(() => this.ejercicioService.ejercicios().length);
  ejerciciosConPeso = computed(() => this.ejercicioService.ejerciciosConPeso().length);
  ejerciciosSinPeso = computed(() => this.ejercicioService.ejerciciosSinPeso().length);
  estadisticas = this.ejercicioService.estadisticasEjercicios;

  ngOnInit() {
    // Los ejercicios se cargan automáticamente por el servicio
  }

  ngOnDestroy() {
    this.busquedaListener?.cleanup();
  }

  /**
   * Cambia el filtro activo
   */
  cambiarFiltro(filtro: string) {
    this.filtroActivo.set(filtro);
  }

  /**
   * Actualiza la búsqueda por nombre
   */
  actualizarBusqueda(evento: Event) {
    const target = evento.target as HTMLInputElement;
    this.busquedaNombre.set(target.value);
  }

  /**
   * Abre el formulario para crear nuevo ejercicio
   */
  abrirFormularioCrear() {
    this.ejercicioEditando.set(null);
    this.limpiarFormulario();
    this.mostrarFormulario.set(true);
  }

  /**
   * Abre el formulario para editar ejercicio existente
   */
  abrirFormularioEditar(ejercicio: EjercicioRutina) {
    this.ejercicioEditando.set(ejercicio);
    this.cargarDatosFormulario(ejercicio);
    this.mostrarFormulario.set(true);
  }

  /**
   * Cierra el formulario
   */
  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.ejercicioEditando.set(null);
    this.limpiarFormulario();
  }

  /**
   * Limpia los datos del formulario
   */
  limpiarFormulario() {
    this.nombre.set('');
    this.descripcion.set('');
    this.series.set(3);
    this.repeticiones.set(10);
    this.peso.set(0);
    this.descansoSegundos.set(60);
  }

  /**
   * Carga datos de ejercicio en el formulario
   */
  cargarDatosFormulario(ejercicio: EjercicioRutina) {
    this.nombre.set(ejercicio.nombre);
    this.descripcion.set(ejercicio.descripcion || '');
    this.series.set(ejercicio.series);
    this.repeticiones.set(ejercicio.repeticiones);
    this.peso.set(ejercicio.peso || 0);
    this.descansoSegundos.set(ejercicio.descansoSegundos || 60);
  }

  /**
   * Guarda el ejercicio (crear o actualizar)
   */
  async guardarEjercicio() {
    const ejercicioEditando = this.ejercicioEditando();

    try {
      const datosEjercicio = {
        nombre: this.nombre(),
        descripcion: this.descripcion(),
        series: this.series(),
        repeticiones: this.repeticiones(),
        peso: this.peso(),
        descansoSegundos: this.descansoSegundos()
      };

      if (ejercicioEditando) {
        // Actualizar ejercicio existente
        await this.ejercicioService.actualizarEjercicio(ejercicioEditando.id, datosEjercicio);
        console.log('Ejercicio actualizado exitosamente');
      } else {
        // Crear nuevo ejercicio
        await this.ejercicioService.crearEjercicio(datosEjercicio);
        console.log('Ejercicio creado exitosamente');
      }

      this.cerrarFormulario();
    } catch (error) {
      console.error('Error al guardar ejercicio:', error);
    }
  }

  /**
   * Elimina un ejercicio
   */
  async eliminarEjercicio(ejercicio: EjercicioRutina) {
    const confirmar = confirm(`¿Eliminar el ejercicio "${ejercicio.nombre}"?`);
    
    if (confirmar) {
      try {
        await this.ejercicioService.eliminarEjercicio(ejercicio.id);
        console.log('Ejercicio eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar ejercicio:', error);
      }
    }
  }

  /**
   * Duplica un ejercicio existente
   */
  async duplicarEjercicio(ejercicio: EjercicioRutina) {
    try {
      await this.ejercicioService.duplicarEjercicio(ejercicio.id);
      console.log('Ejercicio duplicado exitosamente');
    } catch (error) {
      console.error('Error al duplicar ejercicio:', error);
    }
  }

  /**
   * Crea ejercicios de ejemplo
   */
  async crearEjerciciosEjemplo() {
    const ejerciciosEjemplo: Omit<EjercicioRutina, 'id'>[] = [
      {
        nombre: 'Press de Banca',
        descripcion: 'Ejercicio para pecho y tríceps',
        series: 3,
        repeticiones: 10,
        peso: 60,
        descansoSegundos: 90
      },
      {
        nombre: 'Sentadillas',
        descripcion: 'Ejercicio para piernas y glúteos',
        series: 4,
        repeticiones: 12,
        peso: 40,
        descansoSegundos: 120
      },
      {
        nombre: 'Flexiones',
        descripcion: 'Ejercicio de peso corporal para pecho',
        series: 3,
        repeticiones: 15,
        peso: 0,
        descansoSegundos: 60
      },
      {
        nombre: 'Dominadas',
        descripcion: 'Ejercicio de peso corporal para espalda',
        series: 3,
        repeticiones: 8,
        peso: 0,
        descansoSegundos: 90
      },
      {
        nombre: 'Peso Muerto',
        descripcion: 'Ejercicio compuesto para toda la cadena posterior',
        series: 3,
        repeticiones: 8,
        peso: 80,
        descansoSegundos: 180
      }
    ];

    try {
      await this.ejercicioService.crearEjerciciosEnLote(ejerciciosEjemplo);
      console.log('Ejercicios de ejemplo creados exitosamente');
    } catch (error) {
      console.error('Error al crear ejercicios de ejemplo:', error);
    }
  }

  /**
   * Limpia todos los ejercicios
   */
  async limpiarTodosEjercicios() {
    const confirmar = confirm('¿Estás seguro de que quieres eliminar TODOS los ejercicios? Esta acción no se puede deshacer.');
    
    if (confirmar) {
      try {
        const ejercicios = this.ejercicioService.ejercicios();
        for (const ejercicio of ejercicios) {
          await this.ejercicioService.eliminarEjercicio(ejercicio.id);
        }
        console.log('Todos los ejercicios eliminados');
      } catch (error) {
        console.error('Error al eliminar ejercicios:', error);
      }
    }
  }

  /**
   * Obtiene la clase CSS para el badge de peso
   */
  obtenerClasePeso(peso: number | undefined): string {
    if (!peso || peso === 0) {
      return 'bg-gray-100 text-gray-600';
    }
    return 'bg-blue-100 text-blue-800';
  }

  /**
   * Formatea el peso para mostrar
   */
  formatearPeso(peso: number | undefined): string {
    if (!peso || peso === 0) {
      return 'Peso corporal';
    }
    return `${peso} kg`;
  }

  /**
   * Formatea el tiempo de descanso
   */
  formatearDescanso(segundos: number | undefined): string {
    const tiempo = segundos || 60;
    if (tiempo >= 60) {
      const minutos = Math.floor(tiempo / 60);
      const segs = tiempo % 60;
      return segs > 0 ? `${minutos}m ${segs}s` : `${minutos}m`;
    }
    return `${tiempo}s`;
  }

  /**
   * Obtiene el texto del filtro activo
   */
  obtenerTextoFiltro(): string {
    switch (this.filtroActivo()) {
      case 'conPeso': return 'Con Peso';
      case 'sinPeso': return 'Peso Corporal';
      default: return 'Todos';
    }
  }
}
