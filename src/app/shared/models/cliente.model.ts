import { Objetivo } from '../enums/objetivo.enum';

/**
 * Modelo de Cliente - Contiene los datos específicos del cliente.
 * El ID del documento es igual al UID del usuario en Firebase Auth.
 */
export interface Cliente {
    id: string;            // Mismo que el uid del usuario
    gimnasioId: string;    // ID del gimnasio al que pertenece
    activo: boolean;       // Indica si el cliente está activo o no
    fechaRegistro?: Date;  // Fecha de registro del cliente
    objetivo?: Objetivo;   // Objetivo del cliente (antes estaba en User)
}
  