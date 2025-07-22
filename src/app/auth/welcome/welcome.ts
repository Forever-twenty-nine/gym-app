import { Component, inject } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-welcome',
  imports: [IonButton, RouterLink],
  templateUrl: './welcome.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Welcome {


}
