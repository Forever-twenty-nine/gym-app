import { Component, computed, inject } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `./toast.html`, 
})
export class Toast {
  private toastService = inject(ToastService);

  mensaje = this.toastService.mensaje;
  mensajeVisible = computed(() => this.mensaje() !== '');
}
