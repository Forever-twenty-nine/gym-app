import { Injectable, signal, computed, effect, inject, Injector, runInInjectionContext } from '@angular/core';
import { User } from '../models/user.model';
import { rolToLabel } from '../helpers/rol.helpers';
import { Permiso } from '../enums/permiso.enum';
import { doc, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

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
   * 🔄 Inyección de Firestore para operaciones de base de datos
   */
  private readonly injector = inject(Injector);



  /**
   * 📋 Devuelve una lista de etiquetas legibles correspondientes a los roles del usuario actual
   */
  readonly rolesLegibles = computed(() => {
    const roles = this._usuario()?.roles;
    return roles ? roles.map(rolToLabel) : [];
  });

  /**
   * 🔍 Devuelve el rol principal del usuario actual (el primero de la lista)
   */
  readonly permisos = computed(() => this._usuario()?.permisos ?? []);

  tienePermiso = (permiso: Permiso) => this.permisos().includes(permiso);

  tienePermisos = (...permisos: Permiso[]) =>
    permisos.some(p => this.tienePermiso(p));

  /**
   * 🏢 Devuelve el ID del gimnasio asociado al usuario actual (si existe
   * y es un cliente o entrenador de gimnasio)
   */
  readonly gimnasioId = computed(() => this._usuario()?.gimnasioId ?? null);
  readonly entrenadorId = computed(() => this._usuario()?.entrenadorId ?? null);

  /**
   * 🧑‍🏫 Devuelve el ID del entrenador asociado al usuario actual (si es un cliente)
   */
  readonly idInvitador = computed(() =>
    this._usuario()?.gimnasioId ?? this._usuario()?.entrenadorId ?? null
  );

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
   * 🔒 Establece el usuario actual de forma segura
   *
   * - Normaliza los roles y permisos
   * - Actualiza la señal reactiva
   * - Guarda en localStorage
   *
   * @param user Usuario a establecer
   */
  setUsuario(user: User) {
    const usuarioNormalizado: User = {
      ...user,
      roles: [...(user.roles || [])]
    };
    this._usuario.set(usuarioNormalizado);
  }
  /**
   * 🔒 Inicializa el usuario de forma segura, asegurando que el documento exista en Firestore
   *
   * @param user Usuario a inicializar
   */
  async initUsuarioSeguro(user: User) {
    this.setUsuario(user);

    await runInInjectionContext(this.injector, async () => {
      const firestore = inject(Firestore);
      const userRef = doc(firestore, 'usuarios', user.uid);
      await setDoc(userRef, user, { merge: true });
    });
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

  /** 🧾 Asegura que el documento del usuario exista en Firestore */
  async asegurarDocumentoEnFirestore(user: User) {
    await runInInjectionContext(this.injector, async () => {
      const firestore = inject(Firestore);
      const userRef = doc(firestore, 'usuarios', user.uid);
      await setDoc(userRef, user, { merge: true });
    });
  }
}
