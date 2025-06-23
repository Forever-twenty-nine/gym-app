import { ValidatorFn, Validators } from '@angular/forms';
import { Cliente } from '../models/cliente.model';

export interface FieldMeta {
    name: keyof Cliente;
    label: string;
    type?: 'text' | 'email' | 'tel' | 'textarea';
    validators?: ValidatorFn[];
    placeholder?: string;
    validationMessages?: { [key: string]: string };
}

export const CLIENTE_FORM_FIELDS: FieldMeta[] = [
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
];
