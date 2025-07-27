import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './shared/services/toast.service';
import { IonToast, IonApp } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IonToast, IonApp],
  templateUrl: './app.html',
  styleUrls: ['./ionic-styles.css']

})
export class App {

  toast = inject(ToastService);

}
