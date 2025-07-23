import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';
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
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  
  // Variable para manejar el estado de carga
  loading = signal(false);
  // Formulario de inicio de sesión
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Método para verificar si el usuario ya existe en Firestore
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

  // Método para verificar si el usuario ya existe en Firestore
  goTo(path: string) {
    this.router.navigateByUrl(`/auth/${path}`);
  }

  // Método para iniciar sesión con Google
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
