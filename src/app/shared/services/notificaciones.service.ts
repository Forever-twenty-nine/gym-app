import { Injectable, Injector, inject, runInInjectionContext, signal } from '@angular/core';
import {
    Firestore,
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
} from '@angular/fire/firestore';
import { Invitacion } from '../models/invitacion.model';
import { InvitacionesService } from './invitaciones.service';
import { ToastService } from './toast.service';
import { UserService } from './user.service';

/** 🔔 Servicio para notificaciones de invitaciones del usuario */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
    private readonly invitacionesService = inject(InvitacionesService);
    private readonly toast = inject(ToastService);
    private readonly userService = inject(UserService);
    private readonly injector = inject(Injector);

    private readonly collectionName = 'invitaciones';

    private _invitaciones = signal<Invitacion[]>([]);
    public readonly invitaciones = this._invitaciones.asReadonly();

    private unsubscribe?: () => void;

    /** 📡 Escucha en tiempo real las invitaciones pendientes del usuario actual */
    escucharInvitaciones(email: string, tipo: 'cliente' | 'entrenador') {
        runInInjectionContext(this.injector, () => {
            const firestore = inject(Firestore); // ✅ ahora sí, dentro del contexto

            const ref = collection(firestore, this.collectionName);
            const q = query(
                ref,
                where('email', '==', email),
                where('tipo', '==', tipo),
                where('estado', '==', 'pendiente')
            );

            this.unsubscribe?.(); // Limpieza previa
            this.unsubscribe = onSnapshot(q, (snapshot) => {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invitacion[];
                this._invitaciones.set(docs);
            });
        });
    }

    /** ✅ Acepta o rechaza una invitación y actualiza la base de datos */
    async responderInvitacion(invitacion: Invitacion, estado: 'aceptada' | 'rechazada') {
        const userId = this.userService.getUsuarioActual()?.uid;
        if (!userId) {
            this.toast.show('❌ Usuario no autenticado', 'error');
            throw new Error('Usuario no autenticado');
        }

        if (estado === 'aceptada') {
            await this.invitacionesService.procesarInvitacionAceptada(invitacion, userId);
        }

        if (estado === 'rechazada') {
            await runInInjectionContext(this.injector, async () => {
                const firestore = inject(Firestore);
                const ref = doc(firestore, this.collectionName, invitacion.id!);
                await updateDoc(ref, {
                    estado: 'rechazada',
                    fechaRespuesta: new Date(),
                });
            });

            this.toast.show('🚫 Invitación rechazada', 'warning');
        }
    }

    /** 🧹 Deja de escuchar las invitaciones */
    limpiar() {
        this.unsubscribe?.();
    }
}
