export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'empleado';
  empresaId: string;
  activo: boolean;
  empresaNombre?: string; 
}
