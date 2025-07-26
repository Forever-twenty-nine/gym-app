import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonToolbar, IonHeader, IonIcon, IonBadge } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { notificationsOutline, personCircle } from 'ionicons/icons';

addIcons({
  'notifications-outline': notificationsOutline,
  'person-circle': personCircle,
});

@Component({
  selector: 'app-cliente',
  imports: [RouterModule, IonToolbar, IonHeader, IonIcon, IonBadge],
  templateUrl: './cliente.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Cliente {

}
