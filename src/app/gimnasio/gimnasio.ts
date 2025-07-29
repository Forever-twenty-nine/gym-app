import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonBadge, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonTitle, IonToolbar} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { analyticsOutline, barbellOutline, calendarOutline, diamondOutline, notificationsOutline } from 'ionicons/icons';
import { AuthService } from '../shared/services/auth.service';

addIcons({
  'notifications-outline': notificationsOutline,
  'diamond-outline': diamondOutline,
  'calendar-outline': calendarOutline,
  'barbell-outline': barbellOutline,
  'analytics-outline': analyticsOutline

});

@Component({
  selector: 'app-gimnasio',
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton,
    IonIcon,
  ],
  templateUrl: './gimnasio.html',
})
export class Gimnasio {

  private AuthService = inject(AuthService);
  private router = inject(Router);


  logout() {
    this.AuthService.logout();
  }

}
