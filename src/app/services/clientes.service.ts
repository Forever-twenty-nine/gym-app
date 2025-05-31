import { Injectable, inject, signal, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  CollectionReference,
} from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private firestore = inject(Firestore);
  private injector = inject(Injector); // 🔥 Este es el truco clave
  private clientesRef: CollectionReference = collection(this.firestore, 'clientes');

  readonly clientes = toSignal(
    collectionData(this.clientesRef, { idField: 'id' }).pipe(
      map(data => data as Cliente[])
    ),
    { initialValue: [] }
  );

  async agregar(cliente: Omit<Cliente, 'id'>) {
    runInInjectionContext(this.injector, async () => {
      try {
        const docRef = await addDoc(this.clientesRef, cliente);
        console.log('✅ Cliente agregado con ID:', docRef.id);
      } catch (error) {
        console.error('❌ Error al agregar cliente:', error);
      }
    });
  }

  async eliminar(id: string) {
    runInInjectionContext(this.injector, async () => {
      const clienteDoc = doc(this.firestore, `clientes/${id}`);
      await deleteDoc(clienteDoc);
    });
  }

  async actualizar(cliente: Cliente) {
    runInInjectionContext(this.injector, async () => {
      const clienteDoc = doc(this.firestore, `clientes/${cliente.id}`);
      const { id, ...resto } = cliente;
      await updateDoc(clienteDoc, resto);
    });
  }

  async importar(clientes: Omit<Cliente, 'id'>[]) {
    for (const cliente of clientes) {
      await this.agregar(cliente); // ya envuelto
    }
  }

  async obtenerTodos(): Promise<Cliente[]> {
    return await runInInjectionContext(this.injector, async () => {
      const snapshot = await getDocs(this.clientesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Cliente[];
    });
  }
}
