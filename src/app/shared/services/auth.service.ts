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
    User as FirebaseUser
} from '@angular/fire/auth';

import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from '../models/user.model'
import { UserService } from './user.service';


@Injectable({ providedIn: 'root' })
export class AuthService {

    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private userService = inject(UserService);
    private router = inject(Router);


    login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    async register(email: string, password: string) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        const uid = cred.user.uid;
    }

    resetPassword(email: string) {
        return sendPasswordResetEmail(this.auth, email);
    }

    async logout() {
        await signOut(this.auth);
        this.userService.logout();
        this.router.navigateByUrl('/auth/login');
    }

    async loginWithGoogle(): Promise<User> {
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(this.auth, provider);

            const firebaseUser = cred.user;
            if (!firebaseUser) throw new Error('No se pudo obtener el usuario de Google');

            const userRef = doc(this.firestore, 'users', firebaseUser.uid);
            const snap = await getDoc(userRef);

            const perfil = (await getDoc(userRef)).data() as User;
            this.userService.setUsuario(perfil);

            // Verificar si la empresa tiene nombre
            const empresaSnap = await getDoc(doc(this.firestore, 'empresas',));
            if (!empresaSnap.exists() || !empresaSnap.get('nombre')) {
                this.router.navigateByUrl('/perfil');
                return perfil;
            }

            return perfil;

        } catch (error) {
            console.error('❌ loginWithGoogle error:', error);
            throw error; // 
        }
    }

}
