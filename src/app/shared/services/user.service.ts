import { Injectable, signal, computed, effect } from '@angular/core';
import { User } from '../models/user.model';
import { rolToLabel } from '../helpers/rol.helpers';

const STORAGE_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   * 📦 Señal privada que mantiene el estado del usuario actual (global)
   */
  private readonly _usuario = signal<User | null>(null);

  /**
   * 📤 Señal pública de solo lectura que expone el usuario actual (reactiva)
   */
  readonly usuario = this._usuario.asReadonly();

  /**
   * ✅ Indica si hay un usuario cargado en memoria (logueado)
   */
  readonly estaLogueado = computed(() => !!this._usuario());

  /**
   * 📋 Devuelve una lista de etiquetas legibles correspondientes a los roles del usuario actual
   */
  readonly rolesLegibles = computed(() => {
    const roles = this._usuario()?.roles;
    return roles ? roles.map(rolToLabel) : [];
  });

  /**
   * 🛠️ Constructor del servicio
   *
   * - Restaura el usuario desde localStorage (si existe y es válido)
   * - Configura un efecto reactivo que sincroniza el usuario con localStorage automáticamente
   */
  constructor() {
    this.restaurar();

    effect(() => {
      const usuario = this._usuario();
      if (usuario?.onboarded) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  /**
   * 🔄 Intenta restaurar el usuario guardado en localStorage (si es válido)
   */
  private restaurar() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const user = JSON.parse(saved) as User;
      this._usuario.set(user);
    } catch {
      console.warn('⚠️ Usuario inválido en localStorage');
      this._usuario.set(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * 📝 Guarda el usuario actual en memoria
   *
   * - Normaliza la estructura de roles
   * - No guarda directamente en localStorage (el efecto lo hace)
   *
   * @param user Usuario a guardar
   */
  setUsuario(user: User) {
    const usuarioNormalizado: User = {
      ...user,
      roles: [...(user.roles || [])]
    };
    this._usuario.set(usuarioNormalizado);
  }

  /**
   * 🚪 Cierra sesión del usuario
   *
   * - Borra el usuario actual de memoria
   * - El efecto elimina también el dato de localStorage
   */
  logout() {
    this._usuario.set(null);
  }

  /**
   * ✏️ Cambia el nombre del usuario actualmente cargado (si existe)
   *
   * @param nombre Nuevo nombre a asignar
   */
  cambiarNombre(nombre: string) {
    const actual = this._usuario();
    if (!actual) return;

    this._usuario.set({ ...actual, nombre });
  }

  /**
   * 📤 Devuelve el usuario actual de forma sincrónica
   * 
   * - No es reactivo
   * - Útil para lógica imperativa
   *
   * @returns Usuario actual o `null` si no hay ninguno
   */
  getUsuarioActual(): User | null {
    return this._usuario();
  }
}
