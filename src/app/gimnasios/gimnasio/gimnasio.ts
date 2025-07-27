import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-gimnasio',
  imports: [RouterModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent],
  templateUrl: './gimnasio.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Gimnasio {

}
