import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Router } from '@angular/router';
import { IonButtons, IonBackButton, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonButtons, IonBackButton, IonButton],
  templateUrl: './forgot-password.html',
  styleUrls: ['../../ionic-styles.css'],
})
export class ForgotPassword {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(false);
  sent = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.invalid) return;

    const { email } = this.form.value;
    this.loading.set(true);

    this.auth.resetPassword(email!)
      .then(() => {
        this.toast.show('Correo de recuperación enviado', 'success');
        this.sent.set(true);
      })
      .catch(() => this.toast.show('No se pudo enviar el correo', 'error'))
      .finally(() => this.loading.set(false));
  }

  goTo(path: string) {
    this.router.navigateByUrl(`/auth/${path}`);
  }

}
