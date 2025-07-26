import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Gimnasio } from '../models/gimnasio.model';

@Injectable({ providedIn: 'root' })
export class GimnasioService {
  private firestore = inject(Firestore);
  private readonly entrenadoresCollection = 'entrenadores';
  private readonly usuariosCollection = 'usuarios';
  private readonly gimnasiosCollection = 'gimnasios';
  
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  async getEntrenadoresPorGimnasio(gimnasioId: string): Promise<Array<{ id: string; nombre: string; email: string }>> {
    try {
      this._loading.set(true);
      
      // 1. Obtener los IDs de los entrenadores asociados al gimnasio
      const entrenadoresRef = collection(this.firestore, this.entrenadoresCollection);
      const q = query(entrenadoresRef, where('gimnasioId', '==', gimnasioId));
      const snapshot = await getDocs(q);
      const entrenadorIds = snapshot.docs.map(doc => doc.data()['userId']);

      if (entrenadorIds.length === 0) {
        this._loading.set(false);
        return [];
      }

      // 2. Consultar la colección usuarios para traer los datos completos
      const usersRef = collection(this.firestore, this.usuariosCollection);
      const usersQ = query(usersRef, where('uid', 'in', entrenadorIds));
      const usersSnap = await getDocs(usersQ);
      
      const resultado = usersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data['nombre'] || '',
          email: data['email'] || ''
        };
      });
      
      this._loading.set(false);
      return resultado;
    } catch (error: any) {
      console.error('Error al obtener entrenadores por gimnasio:', error);
      this._error.set(error.message || 'Error al obtener entrenadores');
      this._loading.set(false);
      return [];
    }
  }
  
  /**
   * Obtiene un gimnasio por su ID
   */
  async obtenerGimnasioPorId(id: string): Promise<Gimnasio | null> {
    try {
      this._loading.set(true);
      const gimnasioRef = doc(this.firestore, this.gimnasiosCollection, id);
      const snap = await getDoc(gimnasioRef);
      
      this._loading.set(false);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Gimnasio;
      }
      return null;
    } catch (error: any) {
      console.error('Error al obtener gimnasio:', error);
      this._error.set(error.message || 'Error al obtener gimnasio');
      this._loading.set(false);
      return null;
    }
  }
  
  /**
   * Actualiza los datos de un gimnasio
   */
  async actualizarGimnasio(gimnasio: Gimnasio): Promise<void> {
    try {
      this._loading.set(true);
      const gimnasioRef = doc(this.firestore, this.gimnasiosCollection, gimnasio.id);
      const updateData = { ...gimnasio, fechaActualizacion: new Date() };
      await updateDoc(gimnasioRef, updateData);
      this._loading.set(false);
    } catch (error: any) {
      console.error('Error al actualizar gimnasio:', error);
      this._error.set(error.message || 'Error al actualizar gimnasio');
      this._loading.set(false);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo gimnasio
   */
  async crearGimnasio(datos: Omit<Gimnasio, 'id'>): Promise<string> {
    try {
      this._loading.set(true);
      const gimnasiosRef = collection(this.firestore, this.gimnasiosCollection);
      const docRef = await addDoc(gimnasiosRef, {
        ...datos,
        fechaCreacion: new Date(),
        activo: true
      });
      
      // Actualizar con el ID generado
      await updateDoc(docRef, { id: docRef.id });
      
      this._loading.set(false);
      return docRef.id;
    } catch (error: any) {
      console.error('Error al crear gimnasio:', error);
      this._error.set(error.message || 'Error al crear gimnasio');
      this._loading.set(false);
      throw error;
    }
  }
  
  /**
   * Desactiva un gimnasio
   */
  async desactivarGimnasio(id: string): Promise<void> {
    try {
      this._loading.set(true);
      const gimnasioRef = doc(this.firestore, this.gimnasiosCollection, id);
      await updateDoc(gimnasioRef, { 
        activo: false,
        fechaDesactivacion: new Date() 
      });
      this._loading.set(false);
    } catch (error: any) {
      console.error('Error al desactivar gimnasio:', error);
      this._error.set(error.message || 'Error al desactivar gimnasio');
      this._loading.set(false);
      throw error;
    }
  }
}

