import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Rol } from '../shared/enums/rol.enum';
import { runInInjectionContext, Injector } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth, signOut } from '@angular/fire/auth';
import { AuthService } from '../shared/services/auth.service';
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
  private injector = inject(Injector);
  private authService = inject(AuthService);

  usuario = this.userService.usuario;

  public Rol = Rol;

  async logout() {
    await this.authService.logout();
  }
}
