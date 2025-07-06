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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private injector = inject(Injector);

  constructor() {
    onAuthStateChanged(this.auth, (firebaseUser) => {
      runInInjectionContext(this.injector, () => {
        if (firebaseUser) {
          this.loadUser(firebaseUser);
        } else {
          this.userService.logout();
        }
      });
    });
  }

  // 🔑 Login con email y contraseña
  async login(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);

    return runInInjectionContext(this.injector, () => this.loadUser(cred.user));
  }

  // 📝 Registro con email/contraseña
  async register(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    return runInInjectionContext(this.injector, async () => {
      const uid = cred.user.uid;

      const perfil: User = {
        uid,
        email,
        nombre: '',
        rol: Rol.CLIENTE,
        permisos: [Permiso.EJECUTAR_RUTINAS],
       
      };

      await setDoc(doc(this.firestore, 'users', uid), perfil);
      this.userService.setUsuario(perfil);
    });
  }

  // 🏁 Completar onboarding: asignar nombre y rol al usuario
  async completarOnboarding(nombre: string, rol: Rol) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No hay usuario autenticado');

    return runInInjectionContext(this.injector, async () => {
      const perfil: Partial<User> = {
        uid: currentUser.uid,
        email: currentUser.email ?? '',
        nombre,
        rol,
        permisos: []
      };

      await setDoc(doc(this.firestore, 'users', perfil.uid!), perfil);
      this.userService.setUsuario(perfil as User);
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

  // 🔗 Login con Google
  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);

    return runInInjectionContext(this.injector, () => this.loadUser(cred.user));
  }

  // 👤 Cargar usuario desde Firestore o crearlo si no existe
  private async loadUser(firebaseUser: FirebaseUser): Promise<User> {
    const ref = doc(this.firestore, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);

    let perfil: User;

    if (snap.exists()) {
      perfil = snap.data() as User;
      this.userService.setUsuario(perfil);

      if (!perfil.gimnasioId) {
        this.router.navigateByUrl('/perfil');
      } else {
        this.router.navigateByUrl('/onboarding');
      }
    } else {
      perfil = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        nombre: firebaseUser.displayName ?? '',
        rol: Rol.CLIENTE,
        permisos: [Permiso.EJECUTAR_RUTINAS],
        
      };

      await setDoc(ref, perfil);
      this.userService.setUsuario(perfil);
      this.router.navigateByUrl('/perfil');
    }

    return perfil;
  }
}
