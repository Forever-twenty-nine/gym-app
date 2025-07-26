import { Injectable, inject, Injector, NgZone, runInInjectionContext } from '@angular/core';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from '@angular/fire/auth';

import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Cliente } from '../models/cliente.model';
import { Entrenador } from '../models/entrenador.model';
import { Gimnasio } from '../models/gimnasio.model';
import { Rol } from '../enums/rol.enum';
import { Permiso } from '../enums/permiso.enum';
import { UserService } from './user.service';
import { Objetivo } from '../enums/objetivo.enum';
import { hasRol } from '../helpers/rol.helpers';

@Injectable({ providedIn: 'root' })
/**
 * Servicio de autenticación para gestionar login, registro, onboarding y control de sesión de usuarios.
 * Proporciona métodos para autenticación con email/contraseña y Google, recuperación de contraseña,
 * gestión de roles y navegación según el tipo de usuario.
 * Utiliza Firebase Auth y Firestore.
 */
export class AuthService {
  usuarioSignal = signal<User | null>(null);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private injector = inject(Injector);

  constructor() {
    const auth = this.auth;
    const injector = this.injector;

    onAuthStateChanged(auth, (firebaseUser) => {
      runInInjectionContext(injector, () => {
        const url = this.router.url;

        if (firebaseUser) {
          runInInjectionContext(this.injector, () => {
            this.loadUser(firebaseUser);
          });
        } else {
          this.userService.logout();
          if (!url.startsWith('/auth') && !url.startsWith('/onboarding')) {
            this.router.navigateByUrl('/auth/login');
          }
        }
      });
    });
  }

  /**
   * Inicia sesión con email y contraseña.
   * @param {string} email - Email del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<void>} Una promesa que se resuelve cuando el login es exitoso.
   */
  async login(email: string, password: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
    });

  }

  /**
   * Inicia sesión con Google.
   * @returns {Promise<void>} Una promesa que se resuelve cuando el login es exitoso.
   */
  async loginWithGoogle(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);
    });

  }

  /**
   * Registra un usuario con email y contraseña.
   * @param {string} email - Email del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<void>} Una promesa que se resuelve cuando el registro es exitoso.
   */
  async register(email: string, password: string) {
    await runInInjectionContext(this.injector, async () => {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;
      const perfil: User = {
        uid,
        email,
        nombre: '',
        roles: [],
        permisos: [],
        onboarded: false
      };
      await setDoc(doc(this.firestore, 'usuarios', uid), perfil);
      await this.userService.initUsuarioSeguro(perfil);
      this.router.navigateByUrl('/onboarding');
    });
  }

  /**
   * Completa el onboarding asignando nombre, rol y objetivo al usuario.
   * @param {string} nombre - Nombre del usuario.
   * @param {Rol} rol - Rol del usuario.
   * @param {Objetivo | null} objetivo - Objetivo del usuario (solo para clientes).
   * @returns {Promise<void>} Una promesa que se resuelve cuando el onboarding es exitoso.
   */
  async completarOnboarding(nombre: string, rol: Rol, objetivo: Objetivo | null) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No hay usuario autenticado');

    return runInInjectionContext(this.injector, async () => {
      const uid = currentUser.uid;
      const email = currentUser.email ?? '';
      const nombreFinal = nombre.trim();

      // Configuración dinámica por rol
      const rolConfig: Record<Rol, any> = {
        [Rol.CLIENTE]: {
          roles: [Rol.CLIENTE],
          permisos: [Permiso.EJECUTAR_RUTINAS]
        },
        [Rol.ENTRENADOR]: {
          roles: [Rol.ENTRENADOR],
          permisos: [Permiso.CREAR_RUTINAS],
        },
        [Rol.GIMNASIO]: {
          roles: [Rol.GIMNASIO],
          permisos: [Permiso.GESTIONAR_CLIENTES, Permiso.GESTIONAR_ENTRENADORES],
        },
        [Rol.PERSONAL_TRAINER]: {
          roles: [Rol.PERSONAL_TRAINER],
          permisos: [Permiso.GESTIONAR_CLIENTES, Permiso.CREAR_RUTINAS],
        },
      };

      // Crear perfil base del usuario - SOLO datos de autenticación y acceso
      let perfil: User = {
        uid,
        email,
        nombre: nombreFinal,
        onboarded: true,
        ...rolConfig[rol]
      };

      // Actualiza el documento del usuario en Firestore con los datos del onboarding
      await setDoc(doc(this.firestore, 'usuarios', uid), perfil, { merge: true });
      
      // Crear documentos específicos según el rol
      if (rol === Rol.CLIENTE) {
        const cliente: Cliente = {
          id: uid,
          gimnasioId: '', // Se asignará cuando se una a un gimnasio
          activo: true,
          fechaRegistro: new Date()
        };
        
        // Si hay objetivo, se guarda en el documento del cliente
        if (objetivo) {
          cliente.objetivo = objetivo;
        }
        
        await setDoc(doc(this.firestore, 'clientes', uid), cliente);
      } 
      else if (rol === Rol.ENTRENADOR || rol === Rol.PERSONAL_TRAINER) {
        const entrenador: Entrenador = {
          id: uid,
          gimnasioId: rol === Rol.PERSONAL_TRAINER ? uid : '', // Para PERSONAL_TRAINER es su propio gimnasio
          activo: true
        };
        await setDoc(doc(this.firestore, 'entrenadores', uid), entrenador);
      }
      
      await this.userService.initUsuarioSeguro(perfil);
      await this.crearGimnasioSiNoExiste(perfil);
      this.redirectToSection(perfil);
    });
  }

  /**
   * Envía un correo para recuperar la contraseña.
   * @param {string} email - Email del usuario.
   * @returns {Promise<void>} Una promesa que se resuelve cuando el correo es enviado.
   */
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Cierra la sesión del usuario y navega al login.
   * @returns {Promise<void>} Una promesa que se resuelve cuando el logout es exitoso.
   */
  async logout() {
    return runInInjectionContext(this.injector, async () => {
      await signOut(this.auth);
      this.userService.logout();
      // Limpia listeners de notificaciones para evitar errores de permisos
      try {
        const notificacionesService = this.injector.get<any>(
          // Evita error de import circular
          (await import('./notificaciones.service')).NotificacionesService
        );
        notificacionesService.limpiar();
      } catch (e) {
        // Ignora si no está disponible
      }
      this.router.navigateByUrl('/auth/login');
    });
  }

  /**
   * Carga el usuario desde Firestore o lo crea si no existe.
   * @param {FirebaseUser} firebaseUser - Usuario de Firebase autenticado.
   * @returns {Promise<User>} Una promesa que se resuelve con el perfil del usuario.
   */
  private async loadUser(firebaseUser: FirebaseUser): Promise<User> {
    return await runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'usuarios', firebaseUser.uid);
      const snap = await getDoc(ref);

      let perfil: User;

      if (snap.exists()) {
        perfil = snap.data() as User;
        
        // Cargar datos relacionados según el rol
        if (hasRol(perfil, Rol.CLIENTE)) {
          await this.cargarDatosCliente(perfil);
        } 
        else if (hasRol(perfil, Rol.ENTRENADOR) || hasRol(perfil, Rol.PERSONAL_TRAINER)) {
          await this.cargarDatosEntrenador(perfil);
        }
        else if (hasRol(perfil, Rol.GIMNASIO)) {
          await this.cargarDatosGimnasio(perfil);
        }
      } else {
        // Crear un perfil básico para el usuario nuevo
        perfil = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          nombre: firebaseUser.displayName ?? '',
          roles: [Rol.CLIENTE],
          permisos: [Permiso.EJECUTAR_RUTINAS],
        };
        await setDoc(ref, perfil);
        
        // Crear documento de cliente por defecto
        const cliente: Cliente = {
          id: firebaseUser.uid,
          gimnasioId: '',
          activo: true,
          fechaRegistro: new Date()
        };
        await setDoc(doc(this.firestore, 'clientes', firebaseUser.uid), cliente);
      }

      await this.userService.initUsuarioSeguro(perfil);
      this.usuarioSignal.set(perfil);

      if (this.needsOnboarding(perfil)) {
        this.router.navigateByUrl('/onboarding');
      } else {
        this.redirectToSection(perfil);
      }
      return perfil;
    });
  }

  /**
   * Carga datos adicionales del cliente desde Firestore.
   * Puede usarse para cargar datos específicos del cliente en el futuro.
   * @param {User} user - Perfil del usuario.
   * @returns {Promise<void>}
   */
  private async cargarDatosCliente(user: User): Promise<void> {
    // El ID del documento es igual al UID del usuario
    const ref = doc(this.firestore, 'clientes', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const clienteData = snap.data() as Cliente;
      // En el futuro podemos cargar datos específicos del cliente si es necesario
    }
  }

  /**
   * Carga datos adicionales del entrenador desde Firestore.
   * Puede usarse para cargar datos específicos del entrenador en el futuro.
   * @param {User} user - Perfil del usuario.
   * @returns {Promise<void>}
   */
  private async cargarDatosEntrenador(user: User): Promise<void> {
    // El ID del documento es igual al UID del usuario
    const ref = doc(this.firestore, 'entrenadores', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const entrenadorData = snap.data() as Entrenador;
      // En el futuro podemos cargar datos específicos del entrenador si es necesario
    }
  }

  /**
   * Carga datos adicionales del gimnasio desde Firestore.
   * Puede usarse para cargar datos específicos del gimnasio en el futuro.
   * @param {User} user - Perfil del usuario.
   * @returns {Promise<void>}
   */
  private async cargarDatosGimnasio(user: User): Promise<void> {
    // El ID del documento es igual al UID del usuario
    const ref = doc(this.firestore, 'gimnasios', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const gimnasioData = snap.data() as Gimnasio;
      // En el futuro podemos cargar datos específicos del gimnasio si es necesario
    }
  }

  /**
   * Redirige al usuario a la sección correspondiente según su rol.
   * @param {User} user - Perfil del usuario.
   */
  redirectToSection(user: User) {
    switch (true) {
      case hasRol(user, Rol.CLIENTE):
        this.router.navigateByUrl('/cliente');
        break;
      case hasRol(user, Rol.ENTRENADOR):
        this.router.navigateByUrl('/entrenador');
        break;
      case hasRol(user, Rol.GIMNASIO):
        this.router.navigateByUrl('/gimnasio');
        break;
      case hasRol(user, Rol.PERSONAL_TRAINER):
        this.router.navigateByUrl('/gimnasio');
        break;
      default:
        this.router.navigateByUrl('/onboarding');
        break;
    }
  }

  /**
   * Verifica si el usuario necesita completar el onboarding.
   * @param {User} user - Perfil del usuario.
   * @returns {boolean} True si el usuario necesita onboarding, false en caso contrario.
   */
  private needsOnboarding(user: User): boolean {
    return !user.onboarded;
  }

  /**
   * Crea el documento del gimnasio si el usuario tiene rol de gimnasio o personal trainer.
   * @param {User} user - Perfil del usuario.
   * @returns {Promise<void>} Una promesa que se resuelve cuando el documento es creado o ya existe.
   */
  private async crearGimnasioSiNoExiste(user: User) {
    await runInInjectionContext(this.injector, async () => {
      const firestore = inject(Firestore);
      if (hasRol(user, Rol.GIMNASIO) || hasRol(user, Rol.PERSONAL_TRAINER)) {
        const ref = doc(firestore, 'gimnasios', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            id: user.uid,
            direccion: '',
            activo: true,
            nombre: user.nombre,
            email: user.email,
            creadoEn: new Date()
          });
        }
      }
    });
  }

}
