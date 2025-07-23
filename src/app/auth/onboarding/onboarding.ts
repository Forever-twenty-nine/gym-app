import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Rol } from '../../shared/enums/rol.enum';
import { Objetivo } from '../../shared/enums/objetivo.enum';
import { IonButton, IonBackButton, IonInput, IonList, IonItem, IonSelect, IonSelectOption, IonToolbar, IonTitle, IonContent, IonHeader } from "@ionic/angular/standalone";

@Component({
  selector: 'app-onboarding',
  imports: [
    FormsModule,
    IonButton,
    IonBackButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonList,
    IonItem
],
  templateUrl: './onboarding.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Onboarding {
  private auth = inject(AuthService);
  private user = inject(UserService);
  private router = inject(Router);

  nombre = signal('');
  rol = signal<Rol | null>(null);
  objetivo = signal<Objetivo | null>(null);

  loading = signal(false);

  roles = signal<Rol[]>(Object.values(Rol));
  objetivos = signal<Objetivo[]>(Object.values(Objetivo));

  async completar() {
    if (!this.nombre().trim() || !this.rol()) {
      console.warn('🛑 Faltan datos obligatorios');
      return;
    }
    if (this.rol() === Rol.CLIENTE && !this.objetivo()) {
      console.warn('🛑 Objetivo requerido para cliente');
      return;
    }

    this.loading.set(true);
    try {
      if (this.rol() === Rol.CLIENTE) {
        await this.auth.completarOnboarding(
          this.nombre(),
          this.rol()!,
          this.objetivo()!
        );
      } else {

        await this.auth.completarOnboarding(
          this.nombre(),
          this.rol()!,
          Object.values(Objetivo)[0]
        );
      }
    } catch (e) {
      console.error('❌ Error al completar onboarding', e);
    } finally {
      this.loading.set(false);
    }
  }

  logout() {
    this.auth.logout();
  }

}
