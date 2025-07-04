import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  // 👤 Usuario actual reactivo (privado)
  private readonly _usuario = signal<User | null>(null);

  // 👀 Signal de solo lectura para que los componentes lo observen
  get usuario() {
    return this._usuario.asReadonly();
  }

  constructor() {
    // 🧠 Restaurar usuario desde localStorage si existe
    const saved = localStorage.getItem('usuario');
    if (saved) {
      try {
        const user = JSON.parse(saved) as User;
        this._usuario.set(user);
      } catch {
        console.warn('⚠️ Usuario inválido en localStorage');
        localStorage.removeItem('usuario');
      }
    }
  }

  // 📝 Guarda un nuevo usuario y lo persiste
  setUsuario(user: User) {
    this._usuario.set(user);
    localStorage.setItem('usuario', JSON.stringify(user));
  }

  // 🔐 Limpia el usuario actual y el storage
  logout() {
    this._usuario.set(null);
    localStorage.removeItem('usuario');
  }

  // ✏️ Cambia sólo el nombre del usuario actual
  cambiarNombre(nombre: string) {
    const actual = this._usuario();
    if (!actual) return;

    const actualizado = { ...actual, nombre };
    this._usuario.set(actualizado);
    localStorage.setItem('usuario', JSON.stringify(actualizado));
  }

  // 🪪 Devuelve el usuario actual (o null) de forma inmediata
  getUsuarioActual(): User | null {
    return this._usuario();
  }
}
