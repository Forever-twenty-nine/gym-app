import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
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
      repeat: ['', Validators.required],
    },
    {
      validators: (group) => {
        const password = group.get('password')?.value;
        const repeat = group.get('repeat')?.value;
        return password === repeat ? null : { passwordMismatch: true };
      },
    }
  );


  submit() {
    if (this.form.invalid) return;
    const { email, password, repeat } = this.form.value;

    if (password !== repeat) {
      this.toast.show('Las contraseñas no coinciden', 'warning');
      return;
    }

    this.loading.set(true);

    this.auth.register(email!, password!)
      .then(() => {
        this.toast.show('Registro exitoso', 'success');
        this.router.navigateByUrl('/onboarding'); // o '/'
      })
      .catch((err) => {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          this.toast.show('Este correo ya está registrado', 'warning');
        } else {
          this.toast.show('Error al registrar usuario', 'error');
        }
      })
      .finally(() => this.loading.set(false));
  }

  goTo(path: string) {
    this.router.navigateByUrl(`/auth/${path}`);
  }

  loginConGoogle() {
    this.loading.set(true);

    this.auth.loginWithGoogle()
      .then(perfil => {

        this.router.navigateByUrl('/onboarding');

      })
      .catch(() => {
        this.toast.show('No se pudo iniciar sesión con Google', 'error');
      })
      .finally(() => this.loading.set(false));
  }


}
