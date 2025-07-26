import { Rol } from '../enums/rol.enum';
import { Permiso } from '../enums/permiso.enum';

/**
 * Modelo de Usuario - Contiene SOLO información de autenticación y control de acceso.
 * No debe contener datos específicos de roles como cliente, entrenador, etc.
 */
export interface User {
  uid: string;
  nombre: string;
  email: string;
  onboarded?: boolean;
  roles: Rol[]; 
  permisos?: Permiso[];
}
