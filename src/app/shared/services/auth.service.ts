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
          this.loadUser(firebaseUser);
        } else {
          // Limpia estado en tu servicio
          this.userService.logout();

          // Solo redirigir si NO estamos ya en /auth o /onboarding
          if (!url.startsWith('/auth') && !url.startsWith('/onboarding')) {
            this.router.navigateByUrl('/auth/login');
          }
        }
      });
    });
  }

  // 🔑 Login con email y contraseña
  async login(email: string, password: string): Promise<void> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);

  }

  // 🔗 Login con Google
  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);

  }

  // 📝 Registro con email/contraseña
  async register(email: string, password: string) {
    return runInInjectionContext(this.injector, async () => {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);

      const uid = cred.user.uid;

      const perfil: User = {
        uid,
        email,
        nombre: '',
        rol: Rol.CLIENTE,
        permisos: [Permiso.EJECUTAR_RUTINAS],
        onboarded: false
      };

      await setDoc(doc(this.firestore, 'users', uid), perfil);
      this.userService.setUsuario(perfil);

      this.router.navigateByUrl('/onboarding');
    });
  }


  // 🏁 Completar onboarding: asignar nombre y rol al usuario
  async completarOnboarding(nombre: string, rol: Rol, objetivo: Objetivo) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No hay usuario autenticado');

    return runInInjectionContext(this.injector, async () => {
      const uid = currentUser.uid;

      const perfil: User = {
        uid,
        email: currentUser.email ?? '',
        nombre: nombre.trim(),
        rol,
        objetivo,            // 👈 aquí agregamos objetivo
        permisos: [],
        onboarded: true
      };

      // asignar IDs según rol
      switch (rol) {
        case Rol.CLIENTE:
          perfil.clienteId = uid;
          perfil.permisos = [Permiso.EJECUTAR_RUTINAS];
          break;
        case Rol.ENTRENADOR:
          perfil.entrenadorId = uid;
          perfil.permisos = [Permiso.CREAR_RUTINAS, Permiso.EJECUTAR_RUTINAS];
          break;
        case Rol.ADMIN:
        case Rol.ENTRENADOR_ADMIN:
          perfil.gimnasioId = uid;
          perfil.permisos = [
            Permiso.GESTIONAR_USUARIOS,
            Permiso.CREAR_RUTINAS,
            Permiso.EJECUTAR_RUTINAS,
          ];
          break;
      }

      await setDoc(doc(this.firestore, 'users', uid), perfil);
      this.userService.setUsuario(perfil);

      // Navega a la sección correcta según rol
      this.redirectToSection(perfil);
    });
  }



  // 🔄 Recuperar contraseña
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // 🚪 Logout y navegación a login
  async logout() {
    await signOut(this.auth);
    this.userService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  // 👤 Cargar usuario desde Firestore o crearlo si no existe
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
        rol: Rol.CLIENTE,
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

  // 🚀 Redirigir al usuario a la sección correspondiente según su rol
  redirectToSection(user: User) {
    switch (user.rol) {
      case Rol.CLIENTE:
        this.router.navigateByUrl('/cliente');
        break;
      case Rol.ENTRENADOR:
        this.router.navigateByUrl('/entrenador');
        break;
      case Rol.ADMIN:
      case Rol.ENTRENADOR_ADMIN:
        this.router.navigateByUrl('/gimnasio');
        break;
      default:
        this.router.navigateByUrl('/onboarding');
        break;
    }
  }
  // 🆕 Verificar si el usuario necesita completar el onboarding
  private needsOnboarding(user: User): boolean {
    return !user.onboarded;
  }


}
