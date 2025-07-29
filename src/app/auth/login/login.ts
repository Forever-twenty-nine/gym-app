import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { IonButton, IonButtons, IonBackButton, IonInput } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';


@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonBackButton,
    IonInput
  ],
  templateUrl: './login.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Login {
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  
  loading = signal(false);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.loading.set(true);

    this.auth
      .login(email!, password!)
      .catch(() => {
        this.toast.show('Credenciales inválidas', 'error');
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
  goTo(path: string) {
    this.router.navigateByUrl(`/auth/${path}`,);
  }

  loginConGoogle() {
    this.loading.set(true);

    this.auth
      .loginWithGoogle()
      .catch(() => {
        this.toast.show('No se pudo iniciar sesión con Google', 'error');
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}
