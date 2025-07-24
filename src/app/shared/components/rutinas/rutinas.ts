
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RutinaService } from '../../services/rutina.service';
import { EjercicioService } from '../../services/ejercicio.service';
import { RutinaCliente } from '../../models/rutina.model';
import { EjercicioRutina } from '../../models/ejercicio.model';

@Component({
  selector: 'app-rutinas',
  imports: [FormsModule],
  templateUrl: './rutinas.html'
})
export class Rutinas implements OnInit, OnDestroy {

  ejercicioSeleccionado(ejercicio: EjercicioRutina): boolean {
    return this.ejerciciosSeleccionados().some(e => e && e.id === ejercicio.id);
  }


  toggleEjercicioSeleccionado(ejercicio: EjercicioRutina, checked: boolean) {
    const seleccionados = this.ejerciciosSeleccionados();
    if (checked) {
      if (!seleccionados.some(e => e && e.id === ejercicio.id)) {
        this.ejerciciosSeleccionados.set([...seleccionados, ejercicio]);
      }
    } else {
      this.ejerciciosSeleccionados.set(seleccionados.filter(e => e && e.id !== ejercicio.id));
    }
  }

  private rutinaService = inject(RutinaService);
  public ejercicioService = inject(EjercicioService);
  
  // Signals del componente
  entrenadorId = signal<string>('entrenador-123'); // ID de prueba
  mostrarFormulario = signal<boolean>(false);
  rutinaEditando = signal<RutinaCliente | null>(null);
  
  // Datos del formulario
  nombre = signal<string>('');
  clienteId = signal<string>('');
  plantillaRutinaId = signal<string>('');
  gimnasioId = signal<string>('');
  activa = signal<boolean>(true);
  ejerciciosSeleccionados = signal<EjercicioRutina[]>([]);
  // Computed para lista de ejercicios disponibles
  ejerciciosDisponibles = computed(() => this.ejercicioService.ejerciciosPorNombre());
  
  // Signals para rutinas del entrenador
  rutinasEntrenador?: ReturnType<typeof this.rutinaService.obtenerRutinasPorEntrenador>;
  
  // Signals computados
  rutinasActivas = computed(() => 
    this.rutinasEntrenador?.rutinas()?.filter(rutina => rutina.activa) || []
  );
  
  rutinasInactivas = computed(() => 
    this.rutinasEntrenador?.rutinas()?.filter(rutina => !rutina.activa) || []
  );
  
  totalRutinas = computed(() => 
    this.rutinasEntrenador?.rutinas()?.length || 0
  );

  ngOnInit() {
    this.cargarRutinasEntrenador();
  }

  ngOnDestroy() {
    this.rutinasEntrenador?.cleanup();
  }

  /**
   * Carga las rutinas del entrenador
   */
  cargarRutinasEntrenador() {
    const entrenadorId = this.entrenadorId();
    if (entrenadorId) {
      this.rutinasEntrenador = this.rutinaService.obtenerRutinasPorEntrenador(entrenadorId);
    }
  }

  /**
   * Abre el formulario para crear nueva rutina
   */
  abrirFormularioCrear() {
    this.rutinaEditando.set(null);
    this.limpiarFormulario();
    this.mostrarFormulario.set(true);
  }

  /**
   * Abre el formulario para editar rutina existente
   */
  abrirFormularioEditar(rutina: RutinaCliente) {
    this.rutinaEditando.set(rutina);
    this.cargarDatosFormulario(rutina);
    this.mostrarFormulario.set(true);
  }

  /**
   * Cierra el formulario
   */
  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.rutinaEditando.set(null);
    this.limpiarFormulario();
  }

  /**
   * Limpia los datos del formulario
   */
  limpiarFormulario() {
    this.nombre.set('');
    this.clienteId.set('');
    this.plantillaRutinaId.set('');
    this.gimnasioId.set('');
    this.activa.set(true);
    this.ejerciciosSeleccionados.set([]);
  }

  /**
   * Carga datos de rutina en el formulario
   */
  cargarDatosFormulario(rutina: RutinaCliente) {
    this.nombre.set(rutina.nombre);
    this.clienteId.set(rutina.clienteId);
    this.plantillaRutinaId.set(rutina.plantillaRutinaId);
    this.gimnasioId.set(rutina.gimnasioId || '');
    this.activa.set(rutina.activa);
    this.ejerciciosSeleccionados.set(rutina.ejercicios || []);
  }

  /**
   * Guarda la rutina (crear o actualizar)
   */
  async guardarRutina() {
    const rutinaEditando = this.rutinaEditando();
    const ejercicios = this.ejerciciosSeleccionados();

    try {
      if (rutinaEditando) {
        // Actualizar rutina existente
        await this.rutinaService.actualizarRutina(rutinaEditando.id, {
          nombre: this.nombre(),
          clienteId: this.clienteId(),
          plantillaRutinaId: this.plantillaRutinaId(),
          gimnasioId: this.gimnasioId(),
          activa: this.activa(),
          ejercicios
        });
        
        console.log('Rutina actualizada exitosamente');
      } else {
        // Crear nueva rutina
        await this.rutinaService.asignarRutinaACliente(
          this.plantillaRutinaId(),
          this.clienteId(),
          this.nombre(),
          ejercicios,
          this.entrenadorId(),
          this.gimnasioId()
        );
        
        console.log('Rutina creada exitosamente');
      }

      this.cerrarFormulario();
    } catch (error) {
      console.error('Error al guardar rutina:', error);
    }
  }

  /**
   * Elimina una rutina
   */
  async eliminarRutina(rutina: RutinaCliente) {
    const confirmar = confirm(`¿Eliminar la rutina "${rutina.nombre}"?`);
    
    if (confirmar) {
      try {
        await this.rutinaService.eliminarRutina(rutina.id);
        console.log('Rutina eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar rutina:', error);
      }
    }
  }

  /**
   * Cambia el estado activo/inactivo de una rutina
   */
  async cambiarEstadoRutina(rutina: RutinaCliente) {
    try {
      const nuevoEstado = !rutina.activa;
      await this.rutinaService.cambiarEstadoRutina(rutina.id, nuevoEstado);
      
      console.log(`Rutina ${nuevoEstado ? 'activada' : 'desactivada'}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }

  /**
   * Duplica una rutina existente
   */
  async duplicarRutina(rutina: RutinaCliente) {
    try {
      await this.rutinaService.asignarRutinaACliente(
        rutina.plantillaRutinaId,
        rutina.clienteId,
        `${rutina.nombre} (Copia)`,
        rutina.ejercicios,
        this.entrenadorId(),
        rutina.gimnasioId
      );
      
      console.log('Rutina duplicada exitosamente');
    } catch (error) {
      console.error('Error al duplicar rutina:', error);
    }
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES');
  }

  
}
