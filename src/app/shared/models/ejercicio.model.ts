export interface EjercicioRutina {
    id: string;
    nombre: string;
    descripcion?: string;
    series: number;
    repeticiones: number;
    peso?: number;
    descansoSegundos?: number;
}
