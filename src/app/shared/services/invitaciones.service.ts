import { Injectable, inject, signal, runInInjectionContext, Injector } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { Invitacion } from '../models/invitacion.model';

@Injectable({ providedIn: 'root' })
export class InvitacionesService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private readonly collectionName = 'invitaciones';

  private _invitaciones = signal<Invitacion[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  public invitaciones = this._invitaciones.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private unsubscribeInvitaciones?: () => void;

  constructor() {
    runInInjectionContext(this.injector, () => {
      this.inicializarListenerInvitaciones();
    });
  }

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

  obtenerInvitacionesPorCliente(clienteId: string) {
    return signal(this._invitaciones().filter(i => i.clienteId === clienteId));
  }

  async responderInvitacion(id: string, estado: 'aceptada' | 'rechazada') {
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

  async enviarInvitacion(invitacion: Omit<Invitacion, 'id' | 'estado' | 'fechaEnvio'>) {
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
}
