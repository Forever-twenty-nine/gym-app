import { EstadoCliente } from "../utils/utils";

export interface Cliente {
    id?: string; 
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    estado: EstadoCliente;
    fechaCreacion?: Date; 
    fechaActualizacion?: Date; 
}
  