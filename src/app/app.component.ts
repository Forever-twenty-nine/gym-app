import { Component } from '@angular/core';
import { ClientesListComponent } from './components/clientes-list/clientes-list.component';
import { ImportarClientesComponent } from "./components/importar-clientes/importar-clientes.component";
import { ExportarClientesComponent } from "./components/exportar-clientes/exportar-clientes.component";


@Component({
  selector: 'app-root',
  imports: [ClientesListComponent, ImportarClientesComponent, ExportarClientesComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'agenda-clientes';
}
