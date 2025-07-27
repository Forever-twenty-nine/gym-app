import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, setDoc, collectionData, query, where, getDoc } from '@angular/fire/firestore';
import { Invitacion } from '../models/invitacion.model';
import { UserService } from './user.service';
import { ClienteService } from './cliente.service';
import { EntrenadorService } from './entrenador.service';
import { Permiso } from '../enums/permiso.enum';
import { ToastService } from './toast.service';
import { User } from '../models/user.model';
import { Rol } from '../enums/rol.enum';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InvitacionService {
  private readonly userService = inject(UserService);
  private readonly clienteService = inject(ClienteService);
  private readonly entrenadorService = inject(EntrenadorService);
  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'invitaciones';
  
  // Estados para seguimiento
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  /**
   * Obtiene las invitaciones filtradas por estado ('pendiente' o 'aceptada').
   * @param estado Estado de la invitación ('pendiente' o 'aceptada')
   * @returns Observable con el array de invitaciones
   */
  listarInvitacionesPorEstado(estado: 'pendiente' | 'aceptada') {
    return runInInjectionContext(this.injector, () => {
      const ref = collection(this.firestore, this.collectionName);
      return collectionData(query(ref, where('estado', '==', estado)), { idField: 'id' }) as import('rxjs').Observable<Invitacion[]>;
    });
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

    try {
      this._loading.set(true);
      
      await runInInjectionContext(this.injector, async () => {
        const ref = collection(this.firestore, this.collectionName);

        await addDoc(ref, {
          ...invitacion,
          estado: 'pendiente',
          fechaEnvio: new Date()
        });
      });
      
      this._loading.set(false);
      this.toast.show(`✅ Invitación enviada a ${invitacion.email}`, 'success');
    } catch (error: any) {
      this._error.set(error.message || 'Error al enviar invitación');
      this._loading.set(false);
      this.toast.show('❌ Error al enviar invitación: ' + error.message, 'error');
      throw error;
    }
  }

  /**
   * Procesa la aceptación de una invitación:
   * - Crea el documento correspondiente (cliente o entrenador) usando los servicios específicos
   * - Actualiza el usuario con los nuevos roles y permisos
   * - Marca la invitación como aceptada
   *
   * @param invitacion Invitación aceptada
   * @param userId ID del usuario que acepta la invitación
   */
  async procesarInvitacionAceptada(invitacion: Invitacion, userId: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        this._loading.set(true);
        this._error.set(null);
        
        // Verificar si el usuario existe
        const userRef = doc(this.firestore, 'usuarios', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          throw new Error('Usuario no encontrado');
        }
        
        // Verificar si el gimnasio existe
        const gimnasioRef = doc(this.firestore, 'gimnasios', invitacion.invitadorId);
        const gimnasioSnap = await getDoc(gimnasioRef);
        
        if (!gimnasioSnap.exists()) {
          throw new Error('Gimnasio no encontrado');
        }

        if (invitacion.tipo === 'cliente') {
          // Usar el servicio de cliente para crear el cliente
          await this.clienteService.crearCliente(userId, invitacion.invitadorId);
          
          // Actualizar el usuario con los roles y permisos
          await this.actualizarUser(userId, {
            roles: [Rol.CLIENTE],
            permisos: [Permiso.EJECUTAR_RUTINAS],
            onboarded: true
          });
        }

        if (invitacion.tipo === 'entrenador') {
          // Usar el servicio de entrenador para crear el entrenador
          await this.entrenadorService.crearEntrenador(userId, invitacion.invitadorId);
          
          // Actualizar el usuario con los roles y permisos
          await this.actualizarUser(userId, {
            roles: [Rol.ENTRENADOR],
            permisos: [Permiso.CREAR_RUTINAS],
            onboarded: true
          });
        }
        
        await this.marcarInvitacionComoAceptada(invitacion.id!);
        this.toast.show('🎉 Invitación aceptada correctamente', 'success');
        this._loading.set(false);
      } catch (error: any) {
        console.error('Error al procesar invitación:', error);
        this._error.set(error.message || 'Error al procesar la invitación');
        this._loading.set(false);
        this.toast.show('❌ Error al procesar la invitación: ' + error.message, 'error');
        throw error;
      }
    });
  }

  /**
   * Actualiza los datos del usuario en la colección 'usuarios'.
   *
   * @param userId ID del usuario a actualizar
   * @param data Datos a fusionar (merge) en el documento del usuario
   */
  private async actualizarUser(userId: string, data: Partial<User>) {
    const userRef = doc(this.firestore, 'usuarios', userId);
    await setDoc(userRef, data, { merge: true });
  }

  /**
   * Marca una invitación como aceptada en la base de datos.
   *
   * @param id ID de la invitación a actualizar
   */
  private async marcarInvitacionComoAceptada(id: string) {
    const invitacionRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(invitacionRef, {
      estado: 'aceptada',
      fechaRespuesta: new Date()
    });
  }
  
  /**
   * Rechaza una invitación
   * @param id ID de la invitación a rechazar
   */
  async rechazarInvitacion(id: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        this._loading.set(true);
        const invitacionRef = doc(this.firestore, this.collectionName, id);
        await updateDoc(invitacionRef, {
          estado: 'rechazada',
          fechaRespuesta: new Date()
        });
        this._loading.set(false);
        this.toast.show('✅ Invitación rechazada', 'success');
      } catch (error: any) {
        this._error.set(error.message || 'Error al rechazar la invitación');
        this._loading.set(false);
        this.toast.show('❌ Error al rechazar la invitación', 'error');
        throw error;
      }
    });
  }
}
