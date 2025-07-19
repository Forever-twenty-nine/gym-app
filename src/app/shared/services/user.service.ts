import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

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

  /** Intenta restaurar el usuario desde localStorage */
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

  /** Guarda un usuario en memoria y en localStorage */
  setUsuario(user: User) {
    this._usuario.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  /** Limpia el usuario */
  logout() {
    this._usuario.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Cambia sólo el nombre del usuario actual */
  cambiarNombre(nombre: string) {
    const actual = this._usuario();
    if (!actual) return;

    const actualizado = { ...actual, nombre };
    this.setUsuario(actualizado);
  }

  /** Devuelve el usuario actual sincrónicamente */
  getUsuarioActual(): User | null {
    return this._usuario();
  }
}
