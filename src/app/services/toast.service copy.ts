import { Injectable, signal } from '@angular/core';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
    text: string;
    type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _toast = signal<ToastMessage | null>(null);

    show(text: string, type: ToastType = 'info', duration = 3000) {
        this._toast.set({ text, type });
        setTimeout(() => this._toast.set(null), duration);
    }

    get message() {
        return this._toast.asReadonly();
    }
}
