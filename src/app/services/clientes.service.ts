import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {

  private http = inject(HttpClient);
  private _clientes = signal<Cliente[]>([]);
  readonly clientes = this._clientes;

  cargarMock() {
    this.http.get<Cliente[]>('/assets/mocks/clientes.json').subscribe({
      next: (data) => {
        const clientes = data.map(c => ({
          ...c,
          fechaCreacion: c.fechaCreacion ? new Date(c.fechaCreacion) : undefined,
          fechaActualizacion: c.fechaActualizacion ? new Date(c.fechaActualizacion) : undefined
        }));
        this._clientes.set(clientes);
      },
      error: (err) => console.error('❌ Error cargando clientes mock:', err),
    });
  }


  constructor() {
    this.cargarMock();
  }

  agregar(cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) {
    const ahora = new Date();
    const nuevo: Cliente = {
      ...cliente,
      id: crypto.randomUUID(),
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
    };
    this._clientes.update(clientes => [...clientes, nuevo]);
  }

  actualizar(cliente: Cliente) {
    this._clientes.update(clientes =>
      clientes.map(c =>
        c.id === cliente.id
          ? { ...c, ...cliente, fechaActualizacion: new Date() }
          : c
      )
    );
  }
  // Método para eliminar un cliente por ID
  eliminar(id: string) {
    this._clientes.update(clientes => clientes.filter(c => c.id !== id));
  }

  importar(clientes: Omit<Cliente, 'id'>[]) {
    const nuevos = clientes.map(c => ({ ...c, id: crypto.randomUUID() }));
    this._clientes.update(actuales => [...actuales, ...nuevos]);
  }

  obtenerTodos(): Cliente[] {
    return this._clientes();
  }
}
