export interface Invitacion {
  id?: string;
  invitadorId: string
  email: string;
  tipo: 'cliente' | 'entrenador';
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fechaEnvio: Date;
  fechaRespuesta?: Date;
}
