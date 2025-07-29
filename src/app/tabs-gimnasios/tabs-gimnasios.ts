import { Component, EnvironmentInjector, inject } from '@angular/core';
import { RouterModule,Router } from '@angular/router';
import { IonTabBar, IonTabButton, IonLabel, IonTabs} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs-gimnasio',
  standalone: true,
  imports: [IonTabBar, IonTabButton, IonLabel, IonTabs, RouterModule],
  templateUrl: './tabs-gimnasios.html'
})
export class TabsGimnasio {

  public environmentInjector = inject(EnvironmentInjector);

}
