import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { Cliente } from '../.././models/cliente.model';
import { inject } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-importar-clientes',
  templateUrl: './importar-clientes.component.html',
})
export class ImportarClientesComponent {
  private clientesService = inject(ClientesService);
  private toast = inject(ToastService);
  mensaje = this.toast.mensaje;

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const clientesImportados: Cliente[] = (jsonData as any[]).map(row => ({
        nombre: row.nombre || row.Nombre || '',
        telefono: row.telefono || row.Teléfono || row.Telefono || '',
        email: row.email || row.Email || '',
        direccion: row.direccion || row.Dirección || row.Direccion || '',
      }));

      const validos = clientesImportados.filter(
        (nuevo, i, arr) =>
          nuevo.nombre &&
          nuevo.telefono &&
          nuevo.email &&
          nuevo.direccion &&
          arr.findIndex(c =>
            c.telefono === nuevo.telefono ||
            c.email === nuevo.email ||
            c.direccion === nuevo.direccion
          ) === i
      );

      if (validos.length === 0) {
        this.toast.mostrar('No se importaron clientes válidos');
        return;
      }

      await this.clientesService.importar(validos);
      this.toast.mostrar(`Se importaron ${validos.length} cliente(s) correctamente`);
    };

    reader.readAsArrayBuffer(file);
  }
}
