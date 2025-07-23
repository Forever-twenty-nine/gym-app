import { Component, inject } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [IonButton, RouterLink, NgOptimizedImage],
  templateUrl: './welcome.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Welcome {


}
