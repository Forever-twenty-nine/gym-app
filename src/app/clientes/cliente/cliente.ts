import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonHeader, IonIcon, IonBadge, IonChip, IonContent } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { notificationsOutline, diamondOutline, barbellOutline, analyticsOutline, calendarOutline } from 'ionicons/icons';
import { NgOptimizedImage } from '@angular/common';

addIcons({
  'notifications-outline': notificationsOutline,
  'diamond-outline': diamondOutline,
  'calendar-outline': calendarOutline,
  'barbell-outline': barbellOutline,
  'analytics-outline': analyticsOutline

});

@Component({
  selector: 'app-cliente',
  imports: [
    RouterModule,
    NgOptimizedImage,
    IonHeader,
    IonIcon,
    IonBadge,
    IonChip,
    IonContent
],
  templateUrl: './cliente.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Cliente {}
