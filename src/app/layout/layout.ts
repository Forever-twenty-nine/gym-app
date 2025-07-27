import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Rol } from '../shared/enums/rol.enum';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { IonTabBar, IonTabButton, IonLabel, IonTabs, IonIcon, IonRouterOutlet, IonHeader, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, barbellOutline, optionsOutline } from 'ionicons/icons';

addIcons({
  'home-outline': homeOutline,
  'barbell-outline': barbellOutline,
  'options-outline': optionsOutline
});

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    IonIcon,
    IonRouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
 
  ],
  templateUrl: './layout.html',
  styleUrls: ['../ionic-styles.css'],
})
export class Layout {

  private userService = inject(UserService);
  private authService = inject(AuthService);
  usuario = this.userService.usuario;
  public Rol = Rol;

  async logout() {
    await this.authService.logout();
  }
  
}
