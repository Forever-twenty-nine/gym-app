import { Injectable, inject, signal, computed, effect, Injector, runInInjectionContext } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { RutinaCliente } from '../models/rutina.model';

@Injectable({ providedIn: 'root' })
export class RutinaService {

    private firestore = inject(Firestore);
    private injector = inject(Injector);
    private toast = inject(ToastService);
    private readonly collectionName = 'rutinas';

    // Signals para gestión de estado
    private _rutinas = signal<RutinaCliente[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    // Signals públicos (readonly)
    public rutinas = this._rutinas.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    // Signals computados
    public rutinasActivas = computed(() =>
        this._rutinas().filter(rutina => rutina.activa)
    );

    public totalRutinas = computed(() => this._rutinas().length);

    // Listener de Firestore para sincronización en tiempo real
    private unsubscribeRutinas?: () => void;

    constructor() {
        // Usar runInInjectionContext para el listener inicial
        runInInjectionContext(this.injector, () => {
            this.inicializarListenerRutinas();
        });
    }

    /**
     * Inicializa el listener en tiempo real para todas las rutinas
     */
    private inicializarListenerRutinas(): void {
        this._loading.set(true);
        this._error.set(null);

        const rutinasRef = collection(this.firestore, this.collectionName);
        // Simplificar consulta - solo ordenar, sin filtros complejos
        const q = query(rutinasRef);

        this.unsubscribeRutinas = onSnapshot(q,
            (snapshot) => {
                const rutinas = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    fechaAsignacion: doc.data()['fechaAsignacion']?.toDate() || new Date()
                })) as RutinaCliente[];

                // Ordenar localmente por fecha
                rutinas.sort((a, b) => b.fechaAsignacion.getTime() - a.fechaAsignacion.getTime());

                this._rutinas.set(rutinas);
                this._loading.set(false);
                this._error.set(null);
            },
            (error) => {
                const errMsg = (error as any).message || 'Error al cargar rutinas';
                console.error('Error en listener de rutinas:', error);
                this._error.set(errMsg);
                this._loading.set(false);
                this.toast.show(errMsg);
            }
        );
    }

    /**
     * Obtiene rutinas por cliente ID usando signals
     */
    obtenerRutinasPorCliente(clienteId: string): {
        rutinas: () => RutinaCliente[],
        loading: () => boolean,
        error: () => string | null,
        cleanup: () => void
    } {
        return runInInjectionContext(this.injector, () => {
            const rutinasCliente = signal<RutinaCliente[]>([]);
            const loading = signal<boolean>(true);
            const error = signal<string | null>(null);

            const rutinasRef = collection(this.firestore, this.collectionName);
            // Simplificar consulta - solo filtrar por clienteId
            const q = query(rutinasRef, where('clienteId', '==', clienteId));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const rutinas = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        fechaAsignacion: doc.data()['fechaAsignacion']?.toDate() || new Date()
                    })) as RutinaCliente[];

                    // Ordenar localmente por fecha descendente
                    rutinas.sort((a, b) => b.fechaAsignacion.getTime() - a.fechaAsignacion.getTime());

                    rutinasCliente.set(rutinas);
                    loading.set(false);
                    error.set(null);
                },
                (err) => {
                    const errMsg = (err as any).message || 'Error al cargar rutinas del cliente';
                    error.set(errMsg);
                    loading.set(false);
                    this.toast.show(errMsg);
                }
            );

            return {
                rutinas: rutinasCliente.asReadonly(),
                loading: loading.asReadonly(),
                error: error.asReadonly(),
                cleanup: unsubscribe
            };
        });
    }

    /**
     * Obtiene rutinas por entrenador ID usando signals
     */
    obtenerRutinasPorEntrenador(entrenadorId: string): {
        rutinas: () => RutinaCliente[],
        loading: () => boolean,
        error: () => string | null,
        cleanup: () => void
    } {
        return runInInjectionContext(this.injector, () => {
            const rutinasEntrenador = signal<RutinaCliente[]>([]);
            const loading = signal<boolean>(true);
            const error = signal<string | null>(null);

            const rutinasRef = collection(this.firestore, this.collectionName);
            // Simplificar consulta - solo filtrar por entrenadorId
            const q = query(rutinasRef, where('entrenadorId', '==', entrenadorId));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const rutinas = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        fechaAsignacion: doc.data()['fechaAsignacion']?.toDate() || new Date()
                    })) as RutinaCliente[];

                    // Ordenar localmente por fecha descendente
                    rutinas.sort((a, b) => b.fechaAsignacion.getTime() - a.fechaAsignacion.getTime());

                    rutinasEntrenador.set(rutinas);
                    loading.set(false);
                    error.set(null);
                },
                (err) => {
                    const errMsg = (err as any).message || 'Error al cargar rutinas del entrenador';
                    error.set(errMsg);
                    loading.set(false);
                    this.toast.show(errMsg);
                }
            );

            return {
                rutinas: rutinasEntrenador.asReadonly(),
                loading: loading.asReadonly(),
                error: error.asReadonly(),
                cleanup: unsubscribe
            };
        });
    }

    /**
     * Obtiene una rutina por ID
     */
    async obtenerRutinaPorId(id: string): Promise<RutinaCliente | null> {
        try {
            this._loading.set(true);
            const rutinaRef = doc(this.firestore, this.collectionName, id);
            const docSnap = await getDoc(rutinaRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const rutina = {
                    id: docSnap.id,
                    ...data,
                    fechaAsignacion: data['fechaAsignacion']?.toDate() || new Date()
                } as RutinaCliente;

                this._loading.set(false);
                return rutina;
            }

            this._loading.set(false);
            this.toast.show('Rutina no encontrada');
            return null;
        } catch (error) {
            const errMsg = (error as any).message || 'Error al obtener rutina';
            this._error.set(errMsg);
            this._loading.set(false);
            this.toast.show(errMsg);
            throw error;
        }
    }

    /**
     * Crea una nueva rutina
     */
    async crearRutina(rutina: Omit<RutinaCliente, 'id'>): Promise<RutinaCliente> {
        try {
            this._loading.set(true);
            this._error.set(null);

            const rutinasRef = collection(this.firestore, this.collectionName);
            const rutinaData = {
                ...rutina,
                fechaAsignacion: Timestamp.fromDate(rutina.fechaAsignacion || new Date())
            };

            const docRef = await addDoc(rutinasRef, rutinaData);
            const nuevaRutina = {
                id: docRef.id,
                ...rutina,
                fechaAsignacion: rutina.fechaAsignacion || new Date()
            };

            // Actualizar el signal local
            const rutinasActuales = this._rutinas();
            this._rutinas.set([nuevaRutina, ...rutinasActuales]);

            this._loading.set(false);
            this.toast.show('Rutina creada correctamente');
            return nuevaRutina;
        } catch (error) {
            const errMsg = (error as any).message || 'Error al crear rutina';
            this._error.set(errMsg);
            this._loading.set(false);
            this.toast.show(errMsg);
            throw error;
        }
    }

    /**
     * Actualiza una rutina existente
     */
    async actualizarRutina(id: string, rutina: Partial<RutinaCliente>): Promise<void> {
        try {
            this._loading.set(true);
            this._error.set(null);

            const rutinaRef = doc(this.firestore, this.collectionName, id);
            const updateData: any = { ...rutina };

            // Convertir fechas a Timestamp si existen
            if (updateData.fechaAsignacion) {
                updateData.fechaAsignacion = Timestamp.fromDate(updateData.fechaAsignacion);
            }

            await updateDoc(rutinaRef, updateData);

            // Actualizar el signal local
            const rutinasActuales = this._rutinas();
            const index = rutinasActuales.findIndex(r => r.id === id);
            if (index !== -1) {
                const rutinasNuevas = [...rutinasActuales];
                rutinasNuevas[index] = { ...rutinasNuevas[index], ...rutina };
                this._rutinas.set(rutinasNuevas);
            }

            this._loading.set(false);
            this.toast.show('Rutina actualizada correctamente');
        } catch (error) {
            const errMsg = (error as any).message || 'Error al actualizar rutina';
            this._error.set(errMsg);
            this._loading.set(false);
            this.toast.show(errMsg);
            throw error;
        }
    }

    /**
     * Elimina una rutina
     */
    async eliminarRutina(id: string): Promise<void> {
        try {
            this._loading.set(true);
            this._error.set(null);

            const rutinaRef = doc(this.firestore, this.collectionName, id);
            await deleteDoc(rutinaRef);

            // Actualizar el signal local
            const rutinasActuales = this._rutinas();
            const rutinasNuevas = rutinasActuales.filter(r => r.id !== id);
            this._rutinas.set(rutinasNuevas);

            this._loading.set(false);
            this.toast.show('Rutina eliminada correctamente');
        } catch (error) {
            const errMsg = (error as any).message || 'Error al eliminar rutina';
            this._error.set(errMsg);
            this._loading.set(false);
            this.toast.show(errMsg);
            throw error;
        }
    }

    /**
     * Asigna una rutina a un cliente
     */
    async asignarRutinaACliente(
        clienteId: string,
        nombre: string,
        ejercicios: any[] = [],
        entrenadorId?: string,
        gimnasioId?: string
    ): Promise<RutinaCliente> {
        const nuevaRutina: Omit<RutinaCliente, 'id'> = {
            clienteId,
            nombre,
            fechaAsignacion: new Date(),
            ejercicios,
            activa: true,
            progresoEjercicios: [],
            entrenadorId,
            gimnasioId
        };

        return this.crearRutina(nuevaRutina);
    }

    /**
     * Activa o desactiva una rutina
     */
    async cambiarEstadoRutina(id: string, activa: boolean): Promise<void> {
        return this.actualizarRutina(id, { activa });
    }

    /**
     * Obtiene la rutina activa de un cliente
     */
    async obtenerRutinaActivaCliente(clienteId: string): Promise<RutinaCliente | null> {
        try {
            this._loading.set(true);
            const rutinasRef = collection(this.firestore, this.collectionName);
            const q = query(rutinasRef,
                where('clienteId', '==', clienteId),
                where('activa', '==', true)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();
                const rutina = {
                    id: doc.id,
                    ...data,
                    fechaAsignacion: data['fechaAsignacion']?.toDate() || new Date()
                } as RutinaCliente;

                this._loading.set(false);
                return rutina;
            }

            this._loading.set(false);
            return null;
        } catch (error: any) {
            this._error.set(error.message || 'Error al obtener rutina activa');
            this._loading.set(false);
            throw error;
        }
    }

    /**
     * Obtiene rutinas por gimnasio ID usando signals
     */
    obtenerRutinasPorGimnasio(gimnasioId: string): {
        rutinas: () => RutinaCliente[],
        loading: () => boolean,
        error: () => string | null,
        cleanup: () => void
    } {
        return runInInjectionContext(this.injector, () => {
            const rutinasGimnasio = signal<RutinaCliente[]>([]);
            const loading = signal<boolean>(true);
            const error = signal<string | null>(null);

            const rutinasRef = collection(this.firestore, this.collectionName);
            // Simplificar consulta - solo filtrar por gimnasioId
            const q = query(rutinasRef, where('gimnasioId', '==', gimnasioId));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const rutinas = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        fechaAsignacion: doc.data()['fechaAsignacion']?.toDate() || new Date()
                    })) as RutinaCliente[];

                    // Ordenar localmente por fecha descendente
                    rutinas.sort((a, b) => b.fechaAsignacion.getTime() - a.fechaAsignacion.getTime());

                    rutinasGimnasio.set(rutinas);
                    loading.set(false);
                    error.set(null);
                },
                (err) => {
                    const errMsg = (err as any).message || 'Error al cargar rutinas del gimnasio';
                    error.set(errMsg);
                    loading.set(false);
                    this.toast.show(errMsg);
                }
            );

            return {
                rutinas: rutinasGimnasio.asReadonly(),
                loading: loading.asReadonly(),
                error: error.asReadonly(),
                cleanup: unsubscribe
            };
        });
    }

    /**
     * Signal computado para rutinas filtradas por cliente
     */
    rutinasDeCliente = (clienteId: string) => computed(() =>
        this._rutinas().filter(rutina => rutina.clienteId === clienteId)
    );

    /**
     * Signal computado para rutinas filtradas por entrenador
     */
    rutinasDeEntrenador = (entrenadorId: string) => computed(() =>
        this._rutinas().filter(rutina => rutina.entrenadorId === entrenadorId)
    );

    /**
     * Limpia el estado local de rutinas
     */
    limpiarRutinas(): void {
        this._rutinas.set([]);
        this._error.set(null);
        this._loading.set(false);
    }

    /**
     * Limpia los listeners de Firebase
     */
    destruir(): void {
        if (this.unsubscribeRutinas) {
            this.unsubscribeRutinas();
        }
    }
}
