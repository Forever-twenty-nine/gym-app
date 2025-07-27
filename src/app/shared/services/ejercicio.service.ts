import { Injectable, inject, signal, computed, effect, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { EjercicioRutina } from '../models/ejercicio.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class EjercicioService {

    private firestore = inject(Firestore);
    private injector = inject(Injector);
    private toastService = inject(ToastService);
    private readonly collectionName = 'ejercicios';

    // Signals para gestión de estado
    private _ejercicios = signal<EjercicioRutina[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    // Signals públicos (readonly)
    public ejercicios = this._ejercicios.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    // Signals computados
    public totalEjercicios = computed(() => this._ejercicios().length);

    public ejerciciosPorNombre = computed(() => {
        const ejercicios = this._ejercicios();
        return ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    public ejerciciosConPeso = computed(() =>
        this._ejercicios().filter(ejercicio => ejercicio.peso && ejercicio.peso > 0)
    );

    public ejerciciosSinPeso = computed(() =>
        this._ejercicios().filter(ejercicio => !ejercicio.peso || ejercicio.peso === 0)
    );

    // Listener de Firestore para sincronización en tiempo real
    private unsubscribeEjercicios?: () => void;

    constructor() {
        // Usar runInInjectionContext para el listener inicial
        runInInjectionContext(this.injector, () => {
            this.inicializarListenerEjercicios();
        });
    }

    /**
     * Inicializa el listener en tiempo real para todos los ejercicios
     */
    private inicializarListenerEjercicios(): void {
        runInInjectionContext(this.injector, () => {
            this._loading.set(true);
            this._error.set(null);

            const ejerciciosRef = collection(this.firestore, this.collectionName);
            // Consulta simple sin ordenamiento complejo
            const q = query(ejerciciosRef);

            this.unsubscribeEjercicios = onSnapshot(q,
                (snapshot) => {
                    runInInjectionContext(this.injector, () => {
                        const ejercicios = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as EjercicioRutina[];

                        // Ordenar localmente por nombre
                        ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));

                        this._ejercicios.set(ejercicios);
                        this._loading.set(false);
                        this._error.set(null);
                    });
                },
                (error) => {
                    runInInjectionContext(this.injector, () => {
                        this.toastService.show('Error en listener de ejercicios: ' + (error.message || 'Error al cargar ejercicios'), 'error');
                        this._error.set(error.message || 'Error al cargar ejercicios');
                        this._loading.set(false);
                    });
                }
            );
        });
    }

    /**
     * Obtiene ejercicios por nombre (búsqueda) usando signals
     */
    buscarEjerciciosPorNombre(nombreBusqueda: string): {
        ejercicios: () => EjercicioRutina[],
        loading: () => boolean,
        error: () => string | null,
        cleanup: () => void
    } {
        return runInInjectionContext(this.injector, () => {
            const ejerciciosFiltrados = signal<EjercicioRutina[]>([]);
            const loading = signal<boolean>(true);
            const error = signal<string | null>(null);

            const ejerciciosRef = collection(this.firestore, this.collectionName);
            const q = query(ejerciciosRef);

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const ejercicios = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as EjercicioRutina[];

                    // Filtrar localmente por nombre (contiene)
                    const filtrados = ejercicios.filter(ejercicio => 
                        ejercicio.nombre.toLowerCase().includes(nombreBusqueda.toLowerCase())
                    );

                    // Ordenar por relevancia (coincidencias exactas primero)
                    filtrados.sort((a, b) => {
                        const aExacto = a.nombre.toLowerCase() === nombreBusqueda.toLowerCase();
                        const bExacto = b.nombre.toLowerCase() === nombreBusqueda.toLowerCase();
                        
                        if (aExacto && !bExacto) return -1;
                        if (!aExacto && bExacto) return 1;
                        return a.nombre.localeCompare(b.nombre);
                    });

                    ejerciciosFiltrados.set(filtrados);
                    loading.set(false);
                    error.set(null);
                },
                (err) => {
                    error.set(err.message || 'Error al buscar ejercicios');
                    loading.set(false);
                }
            );

            return {
                ejercicios: ejerciciosFiltrados.asReadonly(),
                loading: loading.asReadonly(),
                error: error.asReadonly(),
                cleanup: unsubscribe
            };
        });
    }

    /**
     * Obtiene ejercicios por rango de series usando signals
     */
    obtenerEjerciciosPorSeries(minSeries: number, maxSeries?: number): {
        ejercicios: () => EjercicioRutina[],
        loading: () => boolean,
        error: () => string | null,
        cleanup: () => void
    } {
        return runInInjectionContext(this.injector, () => {
            const ejerciciosFiltrados = signal<EjercicioRutina[]>([]);
            const loading = signal<boolean>(true);
            const error = signal<string | null>(null);

            const ejerciciosRef = collection(this.firestore, this.collectionName);
            const q = query(ejerciciosRef, where('series', '>=', minSeries));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    let ejercicios = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as EjercicioRutina[];

                    // Filtrar localmente por máximo de series si se especifica
                    if (maxSeries !== undefined) {
                        ejercicios = ejercicios.filter(ejercicio => ejercicio.series <= maxSeries);
                    }

                    // Ordenar por número de series
                    ejercicios.sort((a, b) => a.series - b.series);

                    ejerciciosFiltrados.set(ejercicios);
                    loading.set(false);
                    error.set(null);
                },
                (err) => {
                    error.set(err.message || 'Error al obtener ejercicios por series');
                    loading.set(false);
                }
            );

            return {
                ejercicios: ejerciciosFiltrados.asReadonly(),
                loading: loading.asReadonly(),
                error: error.asReadonly(),
                cleanup: unsubscribe
            };
        });
    }

    /**
     * Obtiene un ejercicio por ID
     */
    async obtenerEjercicioPorId(id: string): Promise<EjercicioRutina | null> {
        return runInInjectionContext(this.injector, async () => {
            try {
                this._loading.set(true);
                const ejercicioRef = doc(this.firestore, this.collectionName, id);
                const docSnap = await getDoc(ejercicioRef);

                if (docSnap.exists()) {
                    const ejercicio = {
                        id: docSnap.id,
                        ...docSnap.data()
                    } as EjercicioRutina;

                    this._loading.set(false);
                    return ejercicio;
                }

                this._loading.set(false);
                return null;
            } catch (error: any) {
                this._error.set(error.message || 'Error al obtener ejercicio');
                this._loading.set(false);
                throw error;
            }
        });
    }

    /**
     * Crea un nuevo ejercicio
     */
    async crearEjercicio(ejercicio: Omit<EjercicioRutina, 'id'>): Promise<EjercicioRutina> {
        return runInInjectionContext(this.injector, async () => {
            try {
                this._loading.set(true);
                this._error.set(null);

                const ejerciciosRef = collection(this.firestore, this.collectionName);
                const ejercicioData = {
                    ...ejercicio,
                    nombre: ejercicio.nombre.trim(),
                    descripcion: ejercicio.descripcion?.trim() || '',
                    series: Math.max(1, ejercicio.series),
                    repeticiones: Math.max(1, ejercicio.repeticiones),
                    peso: ejercicio.peso || 0,
                    descansoSegundos: ejercicio.descansoSegundos || 60
                };

                const docRef = await addDoc(ejerciciosRef, ejercicioData);
                const nuevoEjercicio = {
                    id: docRef.id,
                    ...ejercicioData
                };

                this.toastService.show('Ejercicio creado exitosamente', 'success');
                this._loading.set(false);
                return nuevoEjercicio;
            } catch (error: any) {
                this.toastService.show('Error al crear ejercicio: ' + (error.message || ''), 'error');
                this._error.set(error.message || 'Error al crear ejercicio');
                this._loading.set(false);
                throw error;
            }
        });
    }

    /**
     * Actualiza un ejercicio existente
     */
    async actualizarEjercicio(id: string, ejercicio: Partial<EjercicioRutina>): Promise<void> {
        return runInInjectionContext(this.injector, async () => {
            try {
                this._loading.set(true);
                this._error.set(null);

                const ejercicioRef = doc(this.firestore, this.collectionName, id);
                const updateData: any = { ...ejercicio };

                // Validaciones y limpieza de datos
                if (updateData.nombre) {
                    updateData.nombre = updateData.nombre.trim();
                }
                if (updateData.descripcion !== undefined) {
                    updateData.descripcion = updateData.descripcion.trim();
                }
                if (updateData.series !== undefined) {
                    updateData.series = Math.max(1, updateData.series);
                }
                if (updateData.repeticiones !== undefined) {
                    updateData.repeticiones = Math.max(1, updateData.repeticiones);
                }
                if (updateData.peso !== undefined) {
                    updateData.peso = Math.max(0, updateData.peso);
                }
                if (updateData.descansoSegundos !== undefined) {
                    updateData.descansoSegundos = Math.max(0, updateData.descansoSegundos);
                }

                await updateDoc(ejercicioRef, updateData);

                // Actualizar el signal local
                const ejerciciosActuales = this._ejercicios();
                const index = ejerciciosActuales.findIndex(e => e.id === id);
                if (index !== -1) {
                    const ejerciciosNuevos = [...ejerciciosActuales];
                    ejerciciosNuevos[index] = { ...ejerciciosNuevos[index], ...updateData };
                    this._ejercicios.set(ejerciciosNuevos);
                }

                this.toastService.show('Ejercicio actualizado exitosamente', 'success');
                this._loading.set(false);
            } catch (error: any) {
                this.toastService.show('Error al actualizar ejercicio: ' + (error.message || ''), 'error');
                this._error.set(error.message || 'Error al actualizar ejercicio');
                this._loading.set(false);
                throw error;
            }
        });
    }

    /**
     * Elimina un ejercicio 
     * @param id 
     * @returns 
     */
    async eliminarEjercicio(id: string): Promise<void> {
        return runInInjectionContext(this.injector, async () => {
            try {
                this._loading.set(true);
                this._error.set(null);

                const ejercicioRef = doc(this.firestore, this.collectionName, id);
                await deleteDoc(ejercicioRef);

                const ejerciciosActuales = this._ejercicios();
                const ejerciciosNuevos = ejerciciosActuales.filter(e => e.id !== id);
                this._ejercicios.set(ejerciciosNuevos);

                this.toastService.show('Ejercicio eliminado exitosamente', 'success');
                this._loading.set(false);
            } catch (error: any) {
                this.toastService.show('Error al eliminar ejercicio: ' + (error.message || ''), 'error');
                this._error.set(error.message || 'Error al eliminar ejercicio');
                this._loading.set(false);
                throw error;
            }
        });
    }

    /**
     * Duplica un ejercicio existente
     */
    async duplicarEjercicio(id: string, nuevoNombre?: string): Promise<EjercicioRutina> {
        return runInInjectionContext(this.injector, async () => {
            try {
                const ejercicioOriginal = await this.obtenerEjercicioPorId(id);
                
                if (!ejercicioOriginal) {
                    throw new Error('Ejercicio no encontrado');
                }

                const ejercicioDuplicado: Omit<EjercicioRutina, 'id'> = {
                    ...ejercicioOriginal,
                    nombre: nuevoNombre || `${ejercicioOriginal.nombre} (Copia)`
                };

                delete (ejercicioDuplicado as any).id;
                const nuevo = await this.crearEjercicio(ejercicioDuplicado);
                this.toastService.show('Ejercicio duplicado exitosamente', 'success');
                return nuevo;
            } catch (error: any) {
                this.toastService.show('Error al duplicar ejercicio: ' + (error.message || ''), 'error');
                throw error;
            }
        });
    }

    /**
     * Obtiene ejercicios por categoría de peso
     */
    obtenerEjerciciosPorCategoríaPeso(conPeso: boolean): () => EjercicioRutina[] {
        return computed(() => {
            const ejercicios = this._ejercicios();
            return ejercicios.filter(ejercicio => 
                conPeso ? (ejercicio.peso && ejercicio.peso > 0) : (!ejercicio.peso || ejercicio.peso === 0)
            );
        });
    }

    /**
     * Signal computado para estadísticas de ejercicios
     */
    estadisticasEjercicios = computed(() => {
        const ejercicios = this._ejercicios();
        
        return {
            total: ejercicios.length,
            conPeso: ejercicios.filter(e => e.peso && e.peso > 0).length,
            sinPeso: ejercicios.filter(e => !e.peso || e.peso === 0).length,
            promedioSeries: ejercicios.length > 0 ? 
                Math.round(ejercicios.reduce((sum, e) => sum + e.series, 0) / ejercicios.length) : 0,
            promedioRepeticiones: ejercicios.length > 0 ? 
                Math.round(ejercicios.reduce((sum, e) => sum + e.repeticiones, 0) / ejercicios.length) : 0,
            promedioDescanso: ejercicios.length > 0 ? 
                Math.round(ejercicios.reduce((sum, e) => sum + (e.descansoSegundos || 60), 0) / ejercicios.length) : 60
        };
    });

    /**
     * Busca ejercicios por múltiples criterios
     */
    buscarEjercicios(filtros: {
        nombre?: string;
        minSeries?: number;
        maxSeries?: number;
        minRepeticiones?: number;
        maxRepeticiones?: number;
        conPeso?: boolean;
    }): () => EjercicioRutina[] {
        return computed(() => {
            let ejercicios = this._ejercicios();

            // Filtrar por nombre
            if (filtros.nombre) {
                ejercicios = ejercicios.filter(e => 
                    e.nombre.toLowerCase().includes(filtros.nombre!.toLowerCase())
                );
            }

            // Filtrar por series
            if (filtros.minSeries !== undefined) {
                ejercicios = ejercicios.filter(e => e.series >= filtros.minSeries!);
            }
            if (filtros.maxSeries !== undefined) {
                ejercicios = ejercicios.filter(e => e.series <= filtros.maxSeries!);
            }

            // Filtrar por repeticiones
            if (filtros.minRepeticiones !== undefined) {
                ejercicios = ejercicios.filter(e => e.repeticiones >= filtros.minRepeticiones!);
            }
            if (filtros.maxRepeticiones !== undefined) {
                ejercicios = ejercicios.filter(e => e.repeticiones <= filtros.maxRepeticiones!);
            }

            // Filtrar por peso
            if (filtros.conPeso !== undefined) {
                ejercicios = ejercicios.filter(e => 
                    filtros.conPeso ? (e.peso && e.peso > 0) : (!e.peso || e.peso === 0)
                );
            }

            return ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));
        });
    }

    /**
     * Crea ejercicios en lote
     */
    async crearEjerciciosEnLote(ejercicios: Omit<EjercicioRutina, 'id'>[]): Promise<EjercicioRutina[]> {
        return runInInjectionContext(this.injector, async () => {
            try {
                this._loading.set(true);
                this._error.set(null);

                const ejerciciosCreados: EjercicioRutina[] = [];
                const ejerciciosRef = collection(this.firestore, this.collectionName);

                for (const ejercicio of ejercicios) {
                    const ejercicioData = {
                        ...ejercicio,
                        nombre: ejercicio.nombre.trim(),
                        descripcion: ejercicio.descripcion?.trim() || '',
                        series: Math.max(1, ejercicio.series),
                        repeticiones: Math.max(1, ejercicio.repeticiones),
                        peso: ejercicio.peso || 0,
                        descansoSegundos: ejercicio.descansoSegundos || 60
                    };

                    const docRef = await addDoc(ejerciciosRef, ejercicioData);
                    ejerciciosCreados.push({
                        id: docRef.id,
                        ...ejercicioData
                    });
                }

                this.toastService.show('Ejercicios de ejemplo creados exitosamente', 'success');
                this._loading.set(false);
                return ejerciciosCreados;
            } catch (error: any) {
                this.toastService.show('Error al crear ejercicios de ejemplo: ' + (error.message || ''), 'error');
                this._error.set(error.message || 'Error al crear ejercicios en lote');
                this._loading.set(false);
                throw error;
            }
        });
    }

    /**
     * Limpia el estado local de ejercicios
     */
    limpiarEjercicios(): void {
        this._ejercicios.set([]);
        this._error.set(null);
        this._loading.set(false);
    }

    /**
     * Limpia los listeners de Firebase
     */
    destruir(): void {
        if (this.unsubscribeEjercicios) {
            this.unsubscribeEjercicios();
        }
    }
}
