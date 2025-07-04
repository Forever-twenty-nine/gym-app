import { Injectable, inject } from '@angular/core';
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
import { Rol } from '../enums/rol.enum'; // asegúrate de importar bien
import { Permiso } from '../enums/permiso.enum';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private userService = inject(UserService);
    private router = inject(Router);

    constructor() {
        // 🔄 Escucha cambios de sesión automáticamente
        onAuthStateChanged(this.auth, async (firebaseUser) => {
            if (firebaseUser) {
                await this.loadUser(firebaseUser); // 👤 carga perfil si hay sesión
            } else {
                this.userService.logout(); // 🚪 limpia usuario si se cierra sesión
            }
        });
    }

    // 🔑 Login con email y contraseña
    async login(email: string, password: string): Promise<User> {
        const cred = await signInWithEmailAndPassword(this.auth, email, password);
        return await this.loadUser(cred.user);
    }

    // 📝 Registro con email/contraseña, asignando rol y perfil en Firestore
    async register(email: string, password: string, nombre: string, rol: Rol = Rol.CLIENTE) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        const uid = cred.user.uid;

        const perfil: User = {
            uid,
            email,
            nombre,
            rol,
            permisos: [Permiso.EJECUTAR_RUTINAS], // 👟 permiso por defecto
            clienteId: undefined,
            entrenadorId: undefined,
            gimnasioId: undefined
        };

        await setDoc(doc(this.firestore, 'users', uid), perfil);
        this.userService.setUsuario(perfil);
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
        return await this.loadUser(cred.user);
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
                this.router.navigateByUrl('/dashboard');
            }
        } else {
            perfil = {
                uid: firebaseUser.uid,
                email: firebaseUser.email ?? '',
                nombre: firebaseUser.displayName ?? '',
                rol: Rol.CLIENTE,
                permisos: [Permiso.EJECUTAR_RUTINAS],
                clienteId: undefined,
                entrenadorId: undefined,
                gimnasioId: undefined
            };

            await setDoc(ref, perfil);
            this.userService.setUsuario(perfil);
            this.router.navigateByUrl('/perfil');
        }

        return perfil;
    }

}
