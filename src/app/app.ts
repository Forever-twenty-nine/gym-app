import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './shared/services/toast.service';
import { IonToast } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IonToast],
  templateUrl: './app.html'

})
export class App {

  toast = inject(ToastService);

  onDismiss() {
    this.toast.clear();
  }

  getColor(type: 'success' | 'error' | 'info' | 'warning' | undefined) {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'info': return 'primary';
      case 'warning': return 'warning';
      default: return 'primary';
    }
  }


}
