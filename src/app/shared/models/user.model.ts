import { Rol } from '../enums/rol.enum';
import { Permiso } from '../enums/permiso.enum';
import { Objetivo } from '../enums/objetivo.enum';

export interface User {
  uid: string;
  nombre: string;
  email: string;
  onboarded?: boolean;
  objetivo?: Objetivo;
  rol: Rol;
  permisos?: Permiso[];
  clienteId?: string;
  entrenadorId?: string;
  gimnasioId?: string;
}
