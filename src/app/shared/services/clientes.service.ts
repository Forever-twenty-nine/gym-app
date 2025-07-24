import { Injectable, inject, signal, computed, runInInjectionContext, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/cliente.model';
import { Firestore, collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ClientesService {

  private http = inject(HttpClient);
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private readonly collectionName = 'clientes';

  private _clientes = signal<Cliente[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  public clientes = this._clientes.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private unsubscribeClientes?: () => void;

  constructor() {
    runInInjectionContext(this.injector, () => {
      this.inicializarListenerClientes();
    });
  }

  /**
   * Inicializa el listener en tiempo real para todos los clientes
   */
  private inicializarListenerClientes(): void {
    this._loading.set(true);
    this._error.set(null);

    const clientesRef = collection(this.firestore, this.collectionName);
    const q = query(clientesRef);

    this.unsubscribeClientes = onSnapshot(q,
      (snapshot) => {
        const clientes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Cliente[];
        this._clientes.set(clientes);
        this._loading.set(false);
        this._error.set(null);
      },
      (error) => {
        console.error('Error en listener de clientes:', error);
        this._error.set(error.message || 'Error al cargar clientes');
        this._loading.set(false);
      }
    );
  }


  /**
   * Devuelve los clientes asociados a un gimnasio específico (reactivo)
   */
  clientesPorGimnasio = (gimnasioId: string) => computed(() =>
    this._clientes().filter(c => c.gimnasioId === gimnasioId)
  );


  /**
   * Desasocia un cliente (elimina en Firestore)
   */
  async desasociarCliente(id: string) {
    try {
      this._loading.set(true);
      const clienteRef = doc(this.firestore, this.collectionName, id);
      await deleteDoc(clienteRef);
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al desasociar cliente');
      this._loading.set(false);
      throw error;
    }
  }


  /**
   * Prepara la funcionalidad para enviar invitaciones a usuarios registrados
   * (Stub: implementar integración real con backend o notificaciones)
   */
  enviarInvitacion(email: string, gimnasioId: string): void {
    // Aquí se podría llamar a un endpoint o servicio de invitaciones
    // Por ahora solo un stub
    console.log(`Invitación enviada a ${email} para unirse al gimnasio ${gimnasioId}`);
  }


  async actualizar(cliente: Cliente) {
    try {
      this._loading.set(true);
      const clienteRef = doc(this.firestore, this.collectionName, cliente.id);
      const updateData = { ...cliente, fechaActualizacion: new Date() };
      await updateDoc(clienteRef, updateData);
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al actualizar cliente');
      this._loading.set(false);
      throw error;
    }
  }


  // Solo elimina localmente, usar desasociarCliente para eliminar en Firestore
  eliminar(id: string) {
    this._clientes.update(clientes => clientes.filter(c => c.id !== id));
  }


  /**
   * Importa clientes en lote a Firestore
   */
  async importar(clientes: Omit<Cliente, 'id'>[]) {
    try {
      this._loading.set(true);
      const clientesRef = collection(this.firestore, this.collectionName);
      for (const c of clientes) {
        await addDoc(clientesRef, c);
      }
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al importar clientes');
      this._loading.set(false);
      throw error;
    }
  }


  obtenerTodos(): Cliente[] {
    return this._clientes();
  }

  limpiarClientes(): void {
    this._clientes.set([]);
    this._error.set(null);
    this._loading.set(false);
  }

  destruir(): void {
    if (this.unsubscribeClientes) {
      this.unsubscribeClientes();
    }
  }
}
