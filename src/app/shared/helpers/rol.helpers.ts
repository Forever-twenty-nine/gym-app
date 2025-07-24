import { Rol } from '../enums/rol.enum';
import { ROL_OPTIONS } from '../constants/rol.options';

/**
 * Devuelve la etiqueta legible de un rol (útil para tags o listas)
 */
export function rolToLabel(rol: Rol): string {
    return ROL_OPTIONS.find(o => o.value === rol)?.label ?? rol;
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRol(user: { roles: Rol[] }, rol: Rol): boolean {
    return user.roles?.includes(rol);
}
