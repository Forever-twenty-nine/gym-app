import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _message = signal<string | null>(null);
    private _type = signal<ToastType>('info');

    show(message: string, type: ToastType = 'info', duration = 3000) {
        this._message.set(message);
        this._type.set(type);
        setTimeout(() => this.clear(), duration);
    }

    clear() {
        this._message.set(null);
    }

    get message() {
        return this._message.asReadonly();
    }

    get type() {
        return this._type.asReadonly();
    }

    get color() {
        const t = this._type();
        switch (t) {
            case 'success': return 'success';
            case 'error': return 'danger';
            case 'warning': return 'warning';
            case 'info':
            default: return 'primary';
        }
    }
}
