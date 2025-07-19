import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth, signOut } from '@angular/fire/auth';
import { UserService } from '../shared/services/user.service';
import { IonApp, IonHeader, IonToolbar, IonTitle, IonMenu, IonMenuButton, IonContent, IonItem, IonList, IonButton, IonButtons } from '@ionic/angular/standalone';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, 
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonMenu,
    IonMenuButton,
    IonContent,
    IonItem,
    IonList,
    IonButton,
    IonButtons,
  ],
  templateUrl: './layout.html',
})
export class Layout {
  private auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);

  usuario = this.userService.usuario;

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/auth/login']);
  }
}
