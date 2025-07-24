import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { rolToLabel } from '../helpers/rol.helpers';
const STORAGE_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _usuario = signal<User | null>(null);

  get usuario() {
    return this._usuario.asReadonly();
  }

  constructor() {
    this.restaurar();
  }

  // 1️⃣ Intenta restaurar el usuario desde localStorage
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

  // 2️⃣ Guarda un usuario en memoria y en localStorage
  setUsuario(user: User) {
    const usuarioActualizado: User = {
      ...user,
      roles: [...(user.roles || [])],
    };
    this._usuario.set(usuarioActualizado);
    if (usuarioActualizado.onboarded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioActualizado));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // 3️⃣ Devuelve un array de strings legibles con los roles activos del usuario actual
  getRolesActuales(): string[] {
    const actual = this._usuario();
    if (!actual || !actual.roles) return [];
    return actual.roles.map(rol => rolToLabel(rol));
  }

  // 4️⃣ Limpia el usuario
  logout() {
    this._usuario.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // 5️⃣ Cambia sólo el nombre del usuario actual
  cambiarNombre(nombre: string) {
    const actual = this._usuario();
    if (!actual) return;

    const actualizado = { ...actual, nombre };
    this.setUsuario(actualizado);
  }

  // 6️⃣ Devuelve el usuario actual sincrónicamente
  getUsuarioActual(): User | null {
    return this._usuario();
  }
}
