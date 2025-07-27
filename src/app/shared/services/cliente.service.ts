import { Injectable, inject, signal, computed, runInInjectionContext, Injector } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/cliente.model';
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
  setDoc,
  DocumentSnapshot,
  QuerySnapshot 
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private http = inject(HttpClient);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
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
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.inicializarListenerClientes();
        } else {
          this.destruir();
          this.limpiarClientes();
        }
      });
    });
  }

  /**
   * Inicializa el listener en tiempo real para todos los clientes
   * que estén relacionados con el usuario actual según su rol
   */
  private inicializarListenerClientes(): void {
    runInInjectionContext(this.injector, async () => {
      this._loading.set(true);
      this._error.set(null);

      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        this._error.set('No hay usuario autenticado');
        this._loading.set(false);
        return;
      }
      
      try {
        // Obtener el usuario para determinar el rol y filtrar según corresponda
        const userRef = doc(this.firestore, 'usuarios', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          this._error.set('Usuario no encontrado');
          this._loading.set(false);
          return;
        }
        
        const userData = userSnap.data();
        const roles = userData?.['roles'] || [];
        let clientesQuery;
        const clientesRef = collection(this.firestore, this.collectionName);
        
        if (roles.includes('GIMNASIO')) {
          // Si es gimnasio, mostrar todos los clientes asociados a este gimnasio
          clientesQuery = query(clientesRef, where('gimnasioId', '==', userId));
        } else if (roles.includes('ENTRENADOR')) {
          // Para entrenadores, primero necesitamos obtener su gimnasioId
          const entrenadorSnap = await getDoc(doc(this.firestore, 'entrenadores', userId));
          if (entrenadorSnap.exists()) {
            const entrenadorData = entrenadorSnap.data();
            const gimnasioId = entrenadorData?.['gimnasioId'];
            if (gimnasioId) {
              clientesQuery = query(clientesRef, where('gimnasioId', '==', gimnasioId));
            } else {
              this._loading.set(false);
              this._clientes.set([]);
              return;
            }
          } else {
            this._loading.set(false);
            this._clientes.set([]);
            return;
          }
        } else if (roles.includes('CLIENTE')) {
          // Si es cliente, solo ver su propio perfil - El id del documento es igual al userId
          clientesQuery = query(clientesRef, where('id', '==', userId));
        } else if (roles.includes('PERSONAL_TRAINER')) {
          // Personal trainer actúa como su propio gimnasio
          clientesQuery = query(clientesRef, where('gimnasioId', '==', userId));
        } else {
          // Rol no reconocido
          this._loading.set(false);
          this._clientes.set([]);
          return;
        }
        
        // Configurar el listener directamente aquí
        this.unsubscribeClientes = onSnapshot(clientesQuery,
          (snapshot: QuerySnapshot) => {
            runInInjectionContext(this.injector, () => {
              const clientes = snapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
              })) as Cliente[];
              this._clientes.set(clientes);
              this._loading.set(false);
              this._error.set(null);
            });
          },
          (error: Error) => {
            runInInjectionContext(this.injector, () => {
              console.error('Error en listener de clientes:', error);
              this._error.set(error.message || 'Error al cargar clientes');
              this._loading.set(false);
            });
          }
        );
      } catch (error: any) {
        console.error('Error al obtener datos de usuario:', error);
        this._error.set(error.message || 'Error al cargar datos de usuario');
        this._loading.set(false);
      }
    });
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
    return runInInjectionContext(this.injector, async () => {
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
    });
  }

  async actualizar(cliente: Cliente) {
    return runInInjectionContext(this.injector, async () => {
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
    });
  }
  
  /**
   * Asocia un cliente a un gimnasio específico
   * @param clienteId ID del cliente a asociar
   * @param gimnasioId ID del gimnasio al que se asociará
   * @returns Promesa que se resuelve cuando la asociación se completa
   */
  async asociarAGimnasio(clienteId: string, gimnasioId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        this._loading.set(true);
        
        // Verificar que el cliente existe
        const clienteRef = doc(this.firestore, this.collectionName, clienteId);
        const clienteSnap = await getDoc(clienteRef);
        
        if (!clienteSnap.exists()) {
          throw new Error('Cliente no encontrado');
        }
        
        // Verificar que el gimnasio existe
        const gimnasioRef = doc(this.firestore, 'gimnasios', gimnasioId);
        const gimnasioSnap = await getDoc(gimnasioRef);
        
        if (!gimnasioSnap.exists()) {
          throw new Error('Gimnasio no encontrado');
        }
        
        // Actualizar el cliente con el nuevo gimnasioId
        await updateDoc(clienteRef, { 
          gimnasioId, 
          fechaAsociacion: new Date() 
        });
        
        this._loading.set(false);
      } catch (error: any) {
        this._error.set(error.message || 'Error al asociar cliente al gimnasio');
        this._loading.set(false);
        throw error;
      }
    });
  }


  // Solo elimina localmente, usar desasociarCliente para eliminar en Firestore
  eliminar(id: string) {
    this._clientes.update(clientes => clientes.filter(c => c.id !== id));
  }


  /**
   * Importa clientes en lote a Firestore
   */
  async importar(clientes: Omit<Cliente, 'id'>[]) {
    return runInInjectionContext(this.injector, async () => {
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
    });
  }
  
  /**
   * Crea un nuevo cliente y lo asocia a un gimnasio si se proporciona un gimnasioId
   * @param userId ID del usuario asociado al cliente
   * @param gimnasioId ID del gimnasio (opcional)
   * @returns Promise con el ID del cliente creado
   */
  async crearCliente(userId: string, gimnasioId: string = ''): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
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
        
        // Crear el cliente - Usamos el userId como id del documento
        const nuevoCliente: Cliente = {
          id: userId,
          gimnasioId,
          activo: true,
          fechaRegistro: new Date()
        };
        
        // Usar setDoc en lugar de addDoc para establecer el ID manualmente
        const clienteRef = doc(this.firestore, this.collectionName, userId);
        await setDoc(clienteRef, nuevoCliente);
        
        this._loading.set(false);
        return userId;
      } catch (error: any) {
        this._error.set(error.message || 'Error al crear cliente');
        this._loading.set(false);
        throw error;
      }
    });
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
