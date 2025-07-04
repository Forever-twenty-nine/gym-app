import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private userService = inject(UserService);


  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.loading.set(true);

    this.auth.login(email!, password!)
      .then(async cred => {
        const uid = cred.user.uid;
        const ref = doc(this.firestore, 'users', uid);
        const snap = await getDoc(ref);
        const perfil = snap.data() as User;

        this.userService.setUsuario(perfil);


        this.router.navigateByUrl('/dashboard');

      })
      .catch(() => this.toast.show('Credenciales inválidas', 'error'))
      .finally(() => this.loading.set(false));
  }

  goTo(path: string) {
    this.router.navigateByUrl(`/auth/${path}`);
  }

  loginConGoogle() {
    this.loading.set(true);

    this.auth.loginWithGoogle()
      .then(perfil => {
        this.router.navigateByUrl('/dashboard');

      })
      .catch(() => {
        this.toast.show('No se pudo iniciar sesión con Google', 'error');
      })
      .finally(() => this.loading.set(false));
  }


}
