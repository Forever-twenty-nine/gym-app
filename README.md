# AgendaClientes

AgendaClientes is a small contact management application built with Angular. It allows you to keep a list of clients, edit their details and export the information to Excel. The data is loaded from a local JSON file so you can test the app without a backend.

## Features

- View, add and edit clients in a responsive list.
- Remove entries with a confirmation dialog.
- Export the client list to an Excel spreadsheet.
- See a summary with statistics about your client base.

---

## Mejoras a futuro en los formularios

🧱 1. Factorizar el estado del modal en una mini clase utilitaria
En lugar de repetir señales como mostrarX, clienteX, podríamos crear un helper:

```ts
class ModalState<T> {
    readonly visible = signal(false);
    readonly data = signal<T | null>(null);

    open(data: T) {
        this.data.set(data);
        this.visible.set(true);
    }

    close() {
        this.visible.set(false);
        this.data.set(null);
    }
}
```
Y en el componente:

```ts
readonly detalleModal = new ModalState<Cliente>();
readonly formModal = new ModalState<Cliente>();
readonly eliminarModal = new ModalState<Cliente>();
```

Y usás por ejemplo:

```ts
Copiar
Editar
abrirDetalle(cliente: Cliente) {
  this.detalleModal.open(cliente);
}

cerrarDetalle() {
  this.detalleModal.close();
}
```

📦 2. Centralizar constantes y estructura de cliente vacío
```ts
export const CLIENTE_VACIO: Cliente = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: ''
};
```

Entonces usás:

```ts
this.formModal.open(cliente ? { ...cliente } : CLIENTE_VACIO);
```
🧩 3. Reutilizar lógica de formularios
Si más adelante vas a tener más formularios similares, podrías crear un FormHandler<T> que encapsule form, validación y eventos.

