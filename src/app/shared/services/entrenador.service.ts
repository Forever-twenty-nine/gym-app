import { Injectable, inject, signal, computed, runInInjectionContext, Injector } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Entrenador } from '../models/entrenador.model';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  DocumentSnapshot,
  QuerySnapshot 
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class EntrenadorService {

  private http = inject(HttpClient);
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private readonly collectionName = 'entrenadores';

  private _entrenadores = signal<Entrenador[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  public entrenadores = this._entrenadores.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private unsubscribeEntrenadores?: () => void;

  constructor() {
    const auth = inject(Auth);
    runInInjectionContext(this.injector, () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.inicializarListenerEntrenadores();
        } else {
          this.destruir();
          this.limpiarEntrenadores();
        }
      });
    });
  }

  /**
   * Inicializa el listener en tiempo real para los entrenadores
   * según el rol del usuario actual
   */
  private inicializarListenerEntrenadores(): void {
    this._loading.set(true);
    this._error.set(null);

    const auth = inject(Auth);
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      this._error.set('No hay usuario autenticado');
      this._loading.set(false);
      return;
    }
    
    // Obtener el usuario para determinar el rol y filtrar según corresponda
    const userRef = doc(this.firestore, 'usuarios', userId);
    
    getDoc(userRef).then(userSnap => {
      if (!userSnap.exists()) {
        this._error.set('Usuario no encontrado');
        this._loading.set(false);
        return;
      }
      
      const userData = userSnap.data();
      const roles = userData?.['roles'] || [];
      let entrenadoresQuery;
      const entrenadoresRef = collection(this.firestore, this.collectionName);
      
      if (roles.includes('GIMNASIO')) {
        // Si es gimnasio, mostrar todos los entrenadores asociados a este gimnasio
        entrenadoresQuery = query(entrenadoresRef, where('gimnasioId', '==', userId));
      } else if (roles.includes('ENTRENADOR')) {
        // Si es entrenador, solo ver su propio perfil
        entrenadoresQuery = query(entrenadoresRef, where('userId', '==', userId));
      } else if (roles.includes('PERSONAL_TRAINER')) {
        // Personal trainer actúa como su propio gimnasio
        entrenadoresQuery = query(entrenadoresRef, where('gimnasioId', '==', userId));
      } else {
        // Rol no reconocido o cliente (que no debería ver entrenadores directamente)
        this._loading.set(false);
        this._entrenadores.set([]);
        return;
      }
      
      this.configurarSnapshotListener(entrenadoresQuery);
    }).catch(error => {
      console.error('Error al obtener datos de usuario:', error);
      this._error.set(error.message || 'Error al cargar datos de usuario');
      this._loading.set(false);
    });
  }
  
  /**
   * Configura el listener de Firestore con la consulta proporcionada
   */
  private configurarSnapshotListener(q: any): void {
    this.unsubscribeEntrenadores = onSnapshot(q,
      (snapshot: QuerySnapshot) => {
        const entrenadores = snapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        })) as Entrenador[];
        this._entrenadores.set(entrenadores);
        this._loading.set(false);
        this._error.set(null);
      },
      (error: Error) => {
        console.error('Error en listener de entrenadores:', error);
        this._error.set(error.message || 'Error al cargar entrenadores');
        this._loading.set(false);
      }
    );
  }

  /**
   * Devuelve los entrenadores asociados a un gimnasio específico (reactivo)
   */
  entrenadoresPorGimnasio = (gimnasioId: string) => computed(() =>
    this._entrenadores().filter(e => e.gimnasioId === gimnasioId)
  );

  /**
   * Obtiene un entrenador por su ID
   */
  async obtenerPorId(id: string): Promise<Entrenador | null> {
    try {
      this._loading.set(true);
      const entrenadorRef = doc(this.firestore, this.collectionName, id);
      const snap = await getDoc(entrenadorRef);
      this._loading.set(false);
      
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Entrenador;
      }
      return null;
    } catch (error: any) {
      this._error.set(error.message || 'Error al obtener entrenador');
      this._loading.set(false);
      throw error;
    }
  }

  /**
   * Desvincular un entrenador de un gimnasio
   */
  async desvincularEntrenador(id: string) {
    try {
      this._loading.set(true);
      const entrenadorRef = doc(this.firestore, this.collectionName, id);
      
      // Verificar que el entrenador existe
      const entrenadorSnap = await getDoc(entrenadorRef);
      if (!entrenadorSnap.exists()) {
        throw new Error('Entrenador no encontrado');
      }
      
      // Actualizar el campo gimnasioId a cadena vacía para desvincular
      await updateDoc(entrenadorRef, { gimnasioId: '', activo: false });
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al desvincular entrenador');
      this._loading.set(false);
      throw error;
    }
  }

  /**
   * Actualizar datos de un entrenador
   */
  async actualizar(entrenador: Entrenador) {
    try {
      this._loading.set(true);
      const entrenadorRef = doc(this.firestore, this.collectionName, entrenador.id);
      const updateData = { ...entrenador, fechaActualizacion: new Date() };
      await updateDoc(entrenadorRef, updateData);
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al actualizar entrenador');
      this._loading.set(false);
      throw error;
    }
  }
  
  /**
   * Asocia un entrenador a un gimnasio específico
   */
  async asociarAGimnasio(entrenadorId: string, gimnasioId: string): Promise<void> {
    try {
      this._loading.set(true);
      
      // Verificar que el entrenador existe
      const entrenadorRef = doc(this.firestore, this.collectionName, entrenadorId);
      const entrenadorSnap = await getDoc(entrenadorRef);
      
      if (!entrenadorSnap.exists()) {
        throw new Error('Entrenador no encontrado');
      }
      
      // Verificar que el gimnasio existe
      const gimnasioRef = doc(this.firestore, 'gimnasios', gimnasioId);
      const gimnasioSnap = await getDoc(gimnasioRef);
      
      if (!gimnasioSnap.exists()) {
        throw new Error('Gimnasio no encontrado');
      }
      
      // Actualizar el entrenador con el nuevo gimnasioId
      await updateDoc(entrenadorRef, { 
        gimnasioId, 
        activo: true,
        fechaAsociacion: new Date() 
      });
      
      this._loading.set(false);
    } catch (error: any) {
      this._error.set(error.message || 'Error al asociar entrenador al gimnasio');
      this._loading.set(false);
      throw error;
    }
  }

  /**
   * Elimina un entrenador solo localmente
   */
  eliminar(id: string) {
    this._entrenadores.update(entrenadores => entrenadores.filter(e => e.id !== id));
  }

  /**
   * Crea un nuevo entrenador para un usuario existente
   */
  async crearEntrenador(userId: string, gimnasioId: string = ''): Promise<string> {
    try {
      this._loading.set(true);
      
      // Verificar si el usuario existe
      const userRef = doc(this.firestore, 'usuarios', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      // Si se proporciona gimnasioId, verificar que exista
      if (gimnasioId) {
        const gimnasioRef = doc(this.firestore, 'gimnasios', gimnasioId);
        const gimnasioSnap = await getDoc(gimnasioRef);
        
        if (!gimnasioSnap.exists()) {
          throw new Error('Gimnasio no encontrado');
        }
      }
      
      // Crear el entrenador - Usamos el userId como id del documento
      const nuevoEntrenador: Entrenador = {
        id: userId,
        gimnasioId,
        activo: gimnasioId !== ''
      };
      
      // Usar setDoc en lugar de addDoc para establecer el ID manualmente
      const entrenadorRef = doc(this.firestore, this.collectionName, userId);
      await setDoc(entrenadorRef, nuevoEntrenador);
      
      this._loading.set(false);
      return userId;
    } catch (error: any) {
      this._error.set(error.message || 'Error al crear entrenador');
      this._loading.set(false);
      throw error;
    }
  }
  
  /**
   * Busca entrenadores disponibles que no estén asociados a un gimnasio
   */
  async buscarEntrenadoresDisponibles(): Promise<Entrenador[]> {
    try {
      this._loading.set(true);
      const entrenadoresRef = collection(this.firestore, this.collectionName);
      const q = query(entrenadoresRef, where('gimnasioId', '==', ''));
      const snap = await getDocs(q);
      
      const entrenadores = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entrenador[];
      
      this._loading.set(false);
      return entrenadores;
    } catch (error: any) {
      this._error.set(error.message || 'Error al buscar entrenadores disponibles');
      this._loading.set(false);
      throw error;
    }
  }

  /**
   * Devuelve todos los entrenadores en memoria
   */
  obtenerTodos(): Entrenador[] {
    return this._entrenadores();
  }

  /**
   * Limpia la lista de entrenadores en memoria
   */
  limpiarEntrenadores(): void {
    this._entrenadores.set([]);
    this._error.set(null);
    this._loading.set(false);
  }

  /**
   * Destruye el listener de Firestore
   */
  destruir(): void {
    if (this.unsubscribeEntrenadores) {
      this.unsubscribeEntrenadores();
    }
  }
}
