export interface Invitacion {
  id?: string;
  gimnasioId: string;
  email: string;
  tipo: 'cliente' | 'entrenador';
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fechaEnvio: Date;
  fechaRespuesta?: Date;
}
