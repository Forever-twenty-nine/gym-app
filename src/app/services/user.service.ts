import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  // 👤 Usuario actual en signal reactivo (privado)
  private readonly _usuario = signal<User | null>(null);

  // 📥 Signal de solo lectura para el componente
  get usuario() {
    return this._usuario.asReadonly();
  }

  // 🏢 ID de la empresa (derivado)
  readonly empresaId = computed(() => this._usuario()?.empresaId ?? null);

  // 🏷️ Nombre de la empresa (derivado)
  readonly empresaNombre = computed(() => this._usuario()?.empresaNombre?.trim() ?? '');

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

  // 🔐 Elimina el usuario de la sesión y del storage
  logout() {
    this._usuario.set(null);
    localStorage.removeItem('usuario');
  }

  // 💾 Asigna y persiste un nuevo usuario
  setUsuario(user: User) {
    this._usuario.set(user);
    localStorage.setItem('usuario', JSON.stringify(user));
  }

  // ✏️ Cambia solo el nombre del usuario actual
  cambiarNombre(nombre: string) {
    const actual = this._usuario();
    if (!actual) return;

    const actualizado = { ...actual, nombre };
    this._usuario.set(actualizado);
    localStorage.setItem('usuario', JSON.stringify(actualizado));
  }

  // 🏷️ Cambia el nombre de la empresa en el usuario actual
  setEmpresaNombre(nombre: string) {
    const actual = this._usuario();
    if (!actual) return;

    const actualizado = { ...actual, empresaNombre: nombre };
    this._usuario.set(actualizado);
    localStorage.setItem('usuario', JSON.stringify(actualizado));
  }
}
