import { Component, inject } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
@Component({
  selector: 'app-welcome',
  imports: [IonButton],
  templateUrl: './welcome.html',
})
export class Welcome {
  private router = inject(Router);
  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }
}
