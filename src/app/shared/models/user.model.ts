import { Rol } from '../enums/rol.enum';
import { Permiso } from '../enums/permiso.enum';

export interface User {
  empresaId: string;
  uid: string;
  nombre: string;
  email: string;
  rol: Rol;
  permisos?: Permiso[];
  clienteId?: string;
  entrenadorId?: string;
  gimnasioId?: string;
}
