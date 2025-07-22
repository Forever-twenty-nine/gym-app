import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import {
  IonButton,
  IonButtons,
  IonBackButton,
  IonInput,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButtons,
    IonBackButton,
    IonButton,
    IonInput,
  ],
  templateUrl: './register.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: [this.passwordMatchValidator],
    }
  );

  // Validación personalizada para confirmar contraseña
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Envío del formulario
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    this.loading.set(true);

    this.auth
      .register(email!, password!)
      .then(() => {
        this.router.navigateByUrl('/home');
      })
      .catch(() => {
        this.toast.show('No se pudo crear la cuenta', 'error');
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  goTo(path: string) {
    this.router.navigateByUrl(`/auth/${path}`);
  }

  loginConGoogle() {
    this.loading.set(true);

    this.auth
      .loginWithGoogle()
      .then((perfil) => {
        this.router.navigateByUrl('/onboarding');
      })
      .catch(() => {
        this.toast.show('No se pudo iniciar sesión con Google', 'error');
      })
      .finally(() => this.loading.set(false));
  }
}
