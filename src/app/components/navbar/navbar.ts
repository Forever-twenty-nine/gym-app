import { Component,signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html'
})
export class Navbar {

  menuAbierto = signal(false); // ✅ signal reactivo

  toggleMenu() {
    this.menuAbierto.update(v => !v); // ✅ alternar correctamente
  }

}
