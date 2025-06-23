import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-exportar-clientes',
  templateUrl: './exportar-clientes.html',
})
export class ExportarClientes {

  constructor(private clientesService: ClientesService) { }

  async exportar() {
    const clientes = await this.clientesService.obtenerTodos();

    // 👉 Quitamos el 'id' y mejoramos los nombres de columnas
    const datosExportados = clientes.map(({ nombre, telefono, email, direccion }) => ({
      Nombre: nombre,
      Teléfono: telefono,
      Email: email,
      Dirección: direccion,
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    FileSaver.saveAs(blob, 'clientes.xlsx');
  }
}
