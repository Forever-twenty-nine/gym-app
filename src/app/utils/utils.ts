import { Validators } from '@angular/forms';
import { Cliente } from '../models/cliente.model';
import { FieldMeta } from '../models/field-meta.model';

export type EstadoCliente = 'prospecto' | 'presupuesto' | 'cliente';

export type ClienteSinMetadatos = Omit<Cliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;


export const ESTADOS_CLIENTE: EstadoCliente[] = ['prospecto', 'presupuesto', 'cliente'];


// Define los campos del formulario para el modelo Cliente  
export const CLIENTE_FORM_FIELDS: FieldMeta<Cliente>[] = [
    {
        name: 'nombre',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Juan Pérez',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        validationMessages: {
            required: 'El nombre es obligatorio.',
            minlength: 'Debe tener al menos 2 caracteres.',
            maxlength: 'No debe exceder los 50 caracteres.'
        }
    },
    {
        name: 'telefono',
        label: 'Teléfono',
        type: 'tel',
        placeholder: '123456789',
        validators: [Validators.required, Validators.pattern(/^\d{7,15}$/)],
        validationMessages: {
            required: 'El teléfono es obligatorio.',
            pattern: 'Debe contener entre 7 y 15 dígitos numéricos.'
        }
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'correo@ejemplo.com',
        validators: [Validators.required, Validators.email],
        validationMessages: {
            required: 'El email es obligatorio.',
            email: 'El formato del email no es válido.'
        }
    },
    {
        name: 'direccion',
        label: 'Dirección',
        type: 'textarea',
        placeholder: 'Calle Falsa 123',
        validators: [Validators.minLength(5), Validators.maxLength(100)],
        validationMessages: {
            minlength: 'Debe tener al menos 5 caracteres.',
            maxlength: 'No debe exceder los 100 caracteres.'
        }
    }
    , {
        name: 'estado',
        label: 'Estado',
        type: 'select',
        options: ESTADOS_CLIENTE,
        validators: [Validators.required],
        validationMessages: {
            required: 'El estado es obligatorio.'
        }
    }

];

export function claseEstado(estado: EstadoCliente): string {
    const base = 'inline-block px-2 py-1 text-xs font-semibold rounded-full';
    switch (estado) {
        case 'prospecto':
            return `${base} bg-blue-100 text-blue-800`;
        case 'presupuesto':
            return `${base} bg-yellow-100 text-yellow-800`;
        case 'cliente':
            return `${base} bg-green-100 text-green-800`;
        default:
            return `${base} bg-gray-200 text-gray-800`;
    }
}


