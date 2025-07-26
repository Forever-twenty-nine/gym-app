/**
 * Modelo de Entrenador - Contiene los datos específicos del entrenador.
 * El ID del documento es igual al UID del usuario en Firebase Auth.
 */
export interface Entrenador{
    id: string;          // Mismo que el uid del usuario
    gimnasioId: string;  // ID del gimnasio al que pertenece
    activo: boolean;     // Indica si el entrenador está activo o no
}