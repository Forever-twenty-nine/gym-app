import { Injectable, signal, computed, effect, inject, Injector, runInInjectionContext } from '@angular/core';
import { User } from '../models/user.model';
import { rolToLabel } from '../helpers/rol.helpers';
import { Permiso } from '../enums/permiso.enum';
import { doc, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

// Tipo extendido para uso interno que incluye propiedades adicionales no declaradas en la interfaz User
type ExtendedUser = User & {
  gimnasioId?: string;
  entrenadorId?: string;
};

const STORAGE_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   * Señal privada que mantiene el estado del usuario actual (global)
   */
  private readonly _usuario = signal<ExtendedUser | null>(null);
  readonly usuario = this._usuario.asReadonly();
  readonly estaLogueado = computed(() => !!this._usuario());
  private readonly injector = inject(Injector);
  readonly rolesLegibles = computed(() => {
    const roles = this._usuario()?.roles;
    return roles ? roles.map(rolToLabel) : [];
  });
  readonly permisos = computed(() => this._usuario()?.permisos ?? []);
  public tienePermiso = (permiso: Permiso) => this.permisos().includes(permiso);
  public tienePermisos = (...permisos: Permiso[]) =>
    permisos.every(p => this.tienePermiso(p));

  /**
   * Devuelve el ID del gimnasio asociado al usuario actual (si existe
   * y es un cliente o entrenador de gimnasio)
   */
  readonly gimnasioId = computed(() => (this._usuario() as ExtendedUser | null)?.gimnasioId ?? null);
  readonly entrenadorId = computed(() => (this._usuario() as ExtendedUser | null)?.entrenadorId ?? null);

  /**
   * Devuelve el ID del gimnasio o entrenador asociado al usuario actual (prioriza gimnasioId si ambos existen)
   */
  readonly idInvitador = computed(() => {
    const usuario = this._usuario() as ExtendedUser | null;
    return usuario?.gimnasioId ?? usuario?.entrenadorId ?? null;
  });

  /**
   * Constructor del servicio
   *
   * - Restaura el usuario desde localStorage (si existe y es válido)
   * - Configura un efecto reactivo que sincroniza el usuario con localStorage automáticamente
   */
  constructor() {
    this.restaurar();

    effect(() => {
      const usuario = this._usuario();
      if (usuario) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      }
      // Solo se borra en logout explícito
    });
  }

  /**
   * Intenta restaurar el usuario guardado en localStorage (si es válido)
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
   * Inicializa el usuario de forma segura, asegurando que el documento exista en Firestore
   *
   * @param user Usuario a inicializar
   */
  async initUsuarioSeguro(user: User | ExtendedUser) {
    this.setUsuario(user);
    await runInInjectionContext(this.injector, async () => {
      const firestore = inject(Firestore);
      const userRef = doc(firestore, 'usuarios', user.uid);
      await setDoc(userRef, user, { merge: true });
    });
  }

  /**
   * Cierra sesión del usuario
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
  // Eliminada propiedad firestore inyectada directamente

  setUsuario(user: User | ExtendedUser) {
    const usuarioNormalizado: ExtendedUser = {
      ...user,
      roles: Array.isArray(user.roles) ? [...user.roles] : [],
      permisos: Array.isArray(user.permisos) ? [...user.permisos] : []
    };
    this._usuario.set(usuarioNormalizado);
  }

  /**
   * Devuelve el usuario actual de forma sincrónica.
   * No es reactivo. Útil para lógica imperativa.
   * @returns {ExtendedUser|null} Usuario actual o null si no hay ninguno
   */
  getUsuarioActual(): ExtendedUser | null {
    return this._usuario();
  }

  /**
   * Asegura que el documento del usuario exista en Firestore.
   * @param {User|ExtendedUser} user Usuario a asegurar en Firestore
   * @returns {Promise<void>}
   */
  async asegurarDocumentoEnFirestore(user: User | ExtendedUser) {
    await runInInjectionContext(this.injector, async () => {
      const firestore = inject(Firestore);
      const userRef = doc(firestore, 'usuarios', user.uid);
      await setDoc(userRef, user, { merge: true });
    });
  }
}
