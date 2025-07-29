import { Component, inject } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [IonButton, NgOptimizedImage],
  templateUrl: './welcome.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Welcome {
  
  private router = inject(Router);

  goToLogin() {

    this.router.navigateByUrl(`/auth/login`, {
      replaceUrl: true
    });
  }

  goToRegister() {
    this.router.navigateByUrl(`/auth/register`, {
      replaceUrl: true
    });
  }


}
