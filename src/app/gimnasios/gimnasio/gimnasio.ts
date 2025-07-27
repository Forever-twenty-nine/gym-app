import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonBadge, IonContent, IonHeader, IonIcon} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { analyticsOutline, barbellOutline, calendarOutline, diamondOutline, notificationsOutline } from 'ionicons/icons';
import { AuthService } from '../../shared/services/auth.service';

addIcons({
  'notifications-outline': notificationsOutline,
  'diamond-outline': diamondOutline,
  'calendar-outline': calendarOutline,
  'barbell-outline': barbellOutline,
  'analytics-outline': analyticsOutline

});

@Component({
  selector: 'app-gimnasio',
  imports: [RouterModule,IonContent,IonHeader,IonBadge,NgOptimizedImage,IonIcon],
  templateUrl: './gimnasio.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Gimnasio {

  private AuthService = inject(AuthService);

  logout() {
    this.AuthService.logout();
  }

}
