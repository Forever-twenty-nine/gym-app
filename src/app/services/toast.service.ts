import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private mensajeSignal = signal<string>('');
    mensaje = this.mensajeSignal.asReadonly();

    mostrar(mensaje: string, duracionMs = 3000) {
        this.mensajeSignal.set(mensaje);

        setTimeout(() => {
            this.mensajeSignal.set('');
        }, duracionMs);
    }
}
