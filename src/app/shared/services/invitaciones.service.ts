import { Injectable, inject, signal, runInInjectionContext, Injector } from '@angular/core';
import { Firestore, collection, query, onSnapshot, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { computed } from '@angular/core';
import { Invitacion } from '../models/invitacion.model';

@Injectable({ providedIn: 'root' })
export class InvitacionesService {

  invitacionesCliente(clienteId: string) {
    throw new Error('Method not implemented.');
  }

  invitacionesEntrenador(entrenadorId: string) {
    throw new Error('Method not implemented.');
  }

  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private readonly collectionName = 'invitaciones';
  private readonly permisoGestionarUsuarios = 'gestionar_usuarios';

  private _invitaciones = signal<Invitacion[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  public invitaciones = this._invitaciones.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  // Signals computed para invitaciones asociadas por email y tipo
  public invitacionesPorEmail(email: string, tipo: 'cliente' | 'entrenador') {
    return computed(() => this._invitaciones().filter(i => i.email === email && i.tipo === tipo));
  }

  public tieneInvitacion(email: string, tipo: 'cliente' | 'entrenador') {
    return computed(() => this._invitaciones().some(i => i.email === email && i.tipo === tipo));
  }

  constructor() {
    runInInjectionContext(this.injector, () => {
      this.inicializarListenerInvitaciones();
    });
  }

  private unsubscribeInvitaciones?: () => void;

  private inicializarListenerInvitaciones(): void {
    this._loading.set(true);
    this._error.set(null);
    const invitacionesRef = collection(this.firestore, this.collectionName);
    const q = query(invitacionesRef);
    this.unsubscribeInvitaciones = onSnapshot(q,
      (snapshot) => {
        const invitaciones = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invitacion[];
        this._invitaciones.set(invitaciones);
        this._loading.set(false);
        this._error.set(null);
      },
      (error) => {
        this._error.set(error.message || 'Error al cargar invitaciones');
        this._loading.set(false);
      }
    );
  }

  public async enviarInvitacion(
    invitacion: Omit<Invitacion, 'id' | 'estado' | 'fechaEnvio'> & { email: string; tipo: 'cliente' | 'entrenador' },
    permisosUsuario: string[]
  ) {
    if (!permisosUsuario.includes(this.permisoGestionarUsuarios)) {
      this._error.set('No tienes permiso para crear invitaciones');
      throw new Error('No tienes permiso para crear invitaciones');
    }
    try {
      this._loading.set(true);
      const invitacionesRef = collection(this.firestore, this.collectionName);
      await addDoc(invitacionesRef, {
        ...invitacion,
        estado: 'pendiente',
        fechaEnvio: new Date()
      });
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al enviar invitación');
      this._loading.set(false);
      throw error;
    }
  }

  public async responderInvitacion(id: string, estado: 'aceptada' | 'rechazada') {
    try {
      this._loading.set(true);
      const invitacionRef = doc(this.firestore, this.collectionName, id);
      await updateDoc(invitacionRef, { estado, fechaRespuesta: new Date() });
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al responder invitación');
      this._loading.set(false);
      throw error;
    }
  }
}

