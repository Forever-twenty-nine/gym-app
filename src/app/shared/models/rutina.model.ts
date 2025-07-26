import { EjercicioRutina } from "./ejercicio.model";
import { ProgresoEjercicio } from "./progreso.model";

export interface RutinaCliente {
    id: string;
    plantillaRutinaId?: string;
    clienteId: string;
    nombre: string;
    fechaAsignacion: Date;
    ejercicios: EjercicioRutina[];
    activa: boolean;
    progresoEjercicios: ProgresoEjercicio[];
    entrenadorId?: string;
    gimnasioId?: string;
}
