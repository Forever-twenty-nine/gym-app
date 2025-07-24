export interface Invitacion {
  id?: string;
  gimnasioId: string;
  entrenadorId: string;
  clienteId: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fechaEnvio: Date;
  fechaRespuesta?: Date;
}
