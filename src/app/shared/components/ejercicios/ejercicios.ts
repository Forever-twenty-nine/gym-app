import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EjercicioService } from '../../services/ejercicio.service';
import { EjercicioRutina } from '../../models/ejercicio.model';

@Component({
  selector: 'app-ejercicios',
  imports: [FormsModule],
  templateUrl: './ejercicios.html'
})
 export class Ejercicios {

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

    if (busqueda) {
      resultado = resultado.filter(ejercicio => 
        ejercicio.nombre.toLowerCase().includes(busqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(busqueda))
      );
    }
    switch (filtro) {
      case 'conPeso':
        resultado = resultado.filter(e => e.peso && e.peso > 0);
        break;
      case 'sinPeso':
        resultado = resultado.filter(e => !e.peso || e.peso === 0);
        break;
    }
    return resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  // ...existing code...

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
    } else {
      // Crear nuevo ejercicio
      await this.ejercicioService.crearEjercicio(datosEjercicio);
    }

    this.cerrarFormulario();
  }

  /**
   * Elimina un ejercicio
   */
  async eliminarEjercicio(ejercicio: EjercicioRutina) {
    const confirmar = confirm(`¿Eliminar el ejercicio "${ejercicio.nombre}"?`);
    if (confirmar) {
      await this.ejercicioService.eliminarEjercicio(ejercicio.id);
    }
  }

  /**
   * Duplica un ejercicio existente
   */
  async duplicarEjercicio(ejercicio: EjercicioRutina) {
    await this.ejercicioService.duplicarEjercicio(ejercicio.id);
  }

  // ...existing code...

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
