import { Injectable, inject, Injector, NgZone, runInInjectionContext } from '@angular/core';
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
import { Rol } from '../enums/rol.enum';
import { Permiso } from '../enums/permiso.enum';
import { UserService } from './user.service';
import { Objetivo } from '../enums/objetivo.enum';
import { hasRol } from '../helpers/rol.helpers';

@Injectable({ providedIn: 'root' })
export class AuthService {
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

  // 1️⃣🔑 Login con email y contraseña
  async login(email: string, password: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
    });

  }

  // 2️⃣ Login con Google
  async loginWithGoogle(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);
    });

  }

  // 3️⃣ Registro con email/contraseña
  async register(email: string, password: string) {
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

    await runInInjectionContext(this.injector, async () => {
      await setDoc(doc(this.firestore, 'users', uid), perfil);
    });
    this.userService.setUsuario(perfil);
    this.router.navigateByUrl('/onboarding');
  }


  // 4️⃣ Completar onboarding: asignar nombre y rol al usuario
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
          permisos: [Permiso.EJECUTAR_RUTINAS],
          clienteId: uid,
        },
        [Rol.ENTRENADOR]: {
          roles: [Rol.ENTRENADOR],
          permisos: [Permiso.CREAR_RUTINAS],
          entrenadorId: uid,
        },
        [Rol.GIMNASIO]: {
          roles: [Rol.GIMNASIO],
          permisos: [Permiso.GESTIONAR_USUARIOS],
          gimnasioId: uid,
        },
        [Rol.PERSONAL_TRAINER]: {
          roles: [Rol.PERSONAL_TRAINER],
          permisos: [Permiso.GESTIONAR_USUARIOS, Permiso.CREAR_RUTINAS],
          entrenadorId: uid,
          gimnasioId: uid,
        },
      };

      let perfil: User = {
        uid,
        email,
        nombre: nombreFinal,
        onboarded: true,
        ...rolConfig[rol]
      };

      // Solo CLIENTE puede tener objetivo
      if (rol === Rol.CLIENTE && objetivo) {
        (perfil as any).objetivo = objetivo;
      }

      await setDoc(doc(this.firestore, 'users', uid), perfil);
      this.userService.setUsuario(perfil);
      this.redirectToSection(perfil);
    });
  }

  // 5️⃣ Recuperar contraseña
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // 6️⃣ Logout y navegación a login
  async logout() {
    return runInInjectionContext(this.injector, async () => {
      await signOut(this.auth);
      this.userService.logout();
      this.router.navigateByUrl('/auth/login');
    });
  }

  // 7️⃣ Cargar usuario desde Firestore o crearlo si no existe
  private async loadUser(firebaseUser: FirebaseUser): Promise<User> {
    const ref = doc(this.firestore, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);


    let perfil: User;

    if (snap.exists()) {
      perfil = snap.data() as User;
    } else {
      perfil = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        nombre: firebaseUser.displayName ?? '',
        roles: [Rol.CLIENTE],
        permisos: [Permiso.EJECUTAR_RUTINAS],
      };
      await setDoc(ref, perfil);
    }

    this.userService.setUsuario(perfil);

    if (this.needsOnboarding(perfil)) {
      this.router.navigateByUrl('/onboarding');
    } else {
      this.redirectToSection(perfil);
    }
    return perfil;
  }

  // 8️⃣ Redirigir al usuario a la sección correspondiente según su rol
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
  
  // 9️⃣ Verificar si el usuario necesita completar el onboarding
  private needsOnboarding(user: User): boolean {
    return !user.onboarded;
  }
}
