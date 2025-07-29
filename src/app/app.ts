import { Component, inject } from '@angular/core';
import { ToastService } from './shared/services/toast.service';
import { IonToast, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [IonRouterOutlet, IonToast, IonApp],
  templateUrl: './app.html',
  styleUrls: ['./ionic-styles.css']

})
export class App {

  toast = inject(ToastService);

}
