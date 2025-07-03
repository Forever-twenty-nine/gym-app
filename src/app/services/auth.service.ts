import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from '../models/user.model'
import { UserService } from './user.service';
import { EmpresaService } from './empresa.service';
import { PLANES_CONFIG } from '../config/plan.config';
import { Empresa } from '../models/empresa.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
    // Inyectamos los servicios necesarios
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private userService = inject(UserService);
    private router = inject(Router);
    private empresaService = inject(EmpresaService);


    login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    async register(email: string, password: string) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        const uid = cred.user.uid;
        const plan = PLANES_CONFIG['free'];

        const empresa: Empresa = {
            id: uid,
            nombre: '',
            plan: plan.nombre,
            polizaCount: 0,
            limitePolizas: plan.limitePolizas,
            limiteUsuarios: plan.limiteUsuarios,
            configAlertas: {
                diasAnticipacion: 30,
                metodos: ['visual']
            }
        };

        const usuario: User = {
            id: uid,
            email,
            nombre: '',
            rol: 'admin',
            empresaId: uid,
            activo: true
        };

        // Crear documentos
        await setDoc(doc(this.firestore, 'empresas', uid), empresa);
        await setDoc(doc(this.firestore, 'users', uid), usuario);

        this.userService.setUsuario(usuario);
        this.router.navigateByUrl('/perfil');
    }


    resetPassword(email: string) {
        return sendPasswordResetEmail(this.auth, email);
    }

    logout() {
        return signOut(this.auth).then(() => {
            this.userService.logout();
            this.router.navigateByUrl('/auth/login');
        });
    }

    async loginWithGoogle(): Promise<User> {
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(this.auth, provider);

            const firebaseUser = cred.user;
            if (!firebaseUser) throw new Error('No se pudo obtener el usuario de Google');

            const userRef = doc(this.firestore, 'users', firebaseUser.uid);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                const plan = PLANES_CONFIG['free'];

                const nuevaEmpresa: Empresa = {
                    id: firebaseUser.uid,
                    nombre: '',
                    plan: plan.nombre,
                    polizaCount: 0,
                    limitePolizas: plan.limitePolizas,
                    limiteUsuarios: plan.limiteUsuarios,
                    configAlertas: {
                        diasAnticipacion: 30,
                        metodos: ['visual']
                    }
                };

                const nuevoUsuario: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email ?? '',
                    nombre: firebaseUser.displayName ?? '',
                    rol: 'admin',
                    empresaId: firebaseUser.uid,
                    activo: true
                };

                await setDoc(doc(this.firestore, 'empresas', firebaseUser.uid), nuevaEmpresa);
                await setDoc(userRef, nuevoUsuario);
            }


            const perfil = (await getDoc(userRef)).data() as User;
            this.userService.setUsuario(perfil);
            await this.empresaService.cargarEmpresaDesdeFirestore(perfil.empresaId);



            // Verificar si la empresa tiene nombre
            const empresaSnap = await getDoc(doc(this.firestore, 'empresas', perfil.empresaId));
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
