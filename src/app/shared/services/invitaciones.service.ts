import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Invitacion } from '../models/invitacion.model';
import { UserService } from './user.service';
import { Permiso } from '../enums/permiso.enum';
import { ToastService } from './toast.service';
import { User } from '../models/user.model';
import { Rol } from '../enums/rol.enum';

@Injectable({ providedIn: 'root' })
export class InvitacionesService {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);
  private readonly collectionName = 'invitaciones';

  async enviarInvitacion(
    invitacion: Omit<Invitacion, 'id' | 'estado' | 'fechaEnvio'> & {
      email: string;
      tipo: 'cliente' | 'entrenador';
    }
  ) {
    const permisoNecesario =
      invitacion.tipo === 'cliente'
        ? Permiso.GESTIONAR_CLIENTES
        : Permiso.GESTIONAR_ENTRENADORES;

    if (!this.userService.tienePermiso(permisoNecesario)) {
      this.toast.show(`🚫 No tienes permiso para invitar ${invitacion.tipo}s`, 'error');
      throw new Error('No autorizado');
    }

    return runInInjectionContext(this.injector, async () => {
      const firestore = inject(Firestore);
      const ref = collection(firestore, this.collectionName);

      await addDoc(ref, {
        ...invitacion,
        estado: 'pendiente',
        fechaEnvio: new Date()
      });

      this.toast.show(`✅ Invitación enviada a ${invitacion.email}`, 'success');
    });
  }

  async procesarInvitacionAceptada(invitacion: Invitacion, userId: string) {
    return runInInjectionContext(this.injector, async () => {
      const firestore = inject(Firestore);

      if (invitacion.tipo === 'cliente') {
        const clienteRef = collection(firestore, 'clientes');
        const clienteDoc = await addDoc(clienteRef, {
          gimnasioId: invitacion.invitadorId,
          activo: true
        });

        await this.actualizarUser(firestore, userId, {
          clienteId: clienteDoc.id,
          gimnasioId: invitacion.invitadorId,
          roles: [Rol.CLIENTE],
          permisos: [Permiso.EJECUTAR_RUTINAS],
          onboarded: true
        });
      }

      if (invitacion.tipo === 'entrenador') {
        const entrenadorRef = collection(firestore, 'entrenadores');
        const entrenadorDoc = await addDoc(entrenadorRef, {
          gimnasioId: invitacion.invitadorId,
          activo: true
        });

        await this.actualizarUser(firestore, userId, {
          entrenadorId: entrenadorDoc.id,
          gimnasioId: invitacion.invitadorId,
          roles: [Rol.ENTRENADOR],
          permisos: [Permiso.CREAR_RUTINAS],
          onboarded: true
        });
      }

      await this.marcarInvitacionComoAceptada(firestore, invitacion.id!);
      this.toast.show('🎉 Invitación aceptada correctamente', 'success');
    });
  }

  private async actualizarUser(firestore: Firestore, userId: string, data: Partial<User>) {
    const userRef = doc(firestore, 'usuarios', userId);
    await setDoc(userRef, data, { merge: true });
  }

  private async marcarInvitacionComoAceptada(firestore: Firestore, id: string) {
    const invitacionRef = doc(firestore, this.collectionName, id);
    await updateDoc(invitacionRef, {
      estado: 'aceptada',
      fechaRespuesta: new Date()
    });
  }
}
