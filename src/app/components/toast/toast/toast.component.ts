import { Component, computed, inject } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (mensajeVisible()) {
      <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2
             bg-black text-white px-4 py-2 rounded shadow z-50
             max-w-full sm:max-w-sm w-[calc(100%-2rem)] box-border
             opacity-100 transition-opacity duration-500">
      {{ mensaje() }}
      </div>
    }
  `
})
export class ToastComponent {
  private toastService = inject(ToastService);

  mensaje = this.toastService.mensaje;
  mensajeVisible = computed(() => this.mensaje() !== '');
}
