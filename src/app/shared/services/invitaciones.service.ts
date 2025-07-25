import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, setDoc, collectionData, query, where } from '@angular/fire/firestore';
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

  /**
   * Obtiene las invitaciones filtradas por estado ('pendiente' o 'aceptada').
   * @param estado Estado de la invitación ('pendiente' o 'aceptada')
   * @returns Observable con el array de invitaciones
   */
  listarInvitacionesPorEstado(estado: 'pendiente' | 'aceptada') {
    const firestore = inject(Firestore);
    const ref = collection(firestore, this.collectionName);
    return collectionData(query(ref, where('estado', '==', estado)), { idField: 'id' }) as import('rxjs').Observable<Invitacion[]>;
  }

  /**
   * Envía una invitación a un usuario (cliente o entrenador).
   *
   * @param invitacion Objeto con los datos de la invitación (sin id, estado ni fechaEnvio)
   * @throws Error si el usuario no tiene permisos suficientes
   */
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

  /**
   * Procesa la aceptación de una invitación:
   * - Crea el documento correspondiente (cliente o entrenador)
   * - Actualiza el usuario con los nuevos roles y permisos
   * - Marca la invitación como aceptada
   *
   * @param invitacion Invitación aceptada
   * @param userId ID del usuario que acepta la invitación
   */
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

  /**
   * Actualiza los datos del usuario en la colección 'usuarios'.
   *
   * @param firestore Instancia de Firestore
   * @param userId ID del usuario a actualizar
   * @param data Datos a fusionar (merge) en el documento del usuario
   */
  private async actualizarUser(firestore: Firestore, userId: string, data: Partial<User>) {
    await runInInjectionContext(this.injector, async () => {
      const userRef = doc(firestore, 'usuarios', userId);
      await setDoc(userRef, data, { merge: true });
    });
  }

  /**
   * Marca una invitación como aceptada en la base de datos.
   *
   * @param firestore Instancia de Firestore
   * @param id ID de la invitación a actualizar
   */
  private async marcarInvitacionComoAceptada(firestore: Firestore, id: string) {
    await runInInjectionContext(this.injector, async () => {
      const invitacionRef = doc(firestore, this.collectionName, id);
      await updateDoc(invitacionRef, {
        estado: 'aceptada',
        fechaRespuesta: new Date()
      });
    });
  }
}
