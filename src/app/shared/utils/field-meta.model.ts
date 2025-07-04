import { ValidatorFn } from '@angular/forms';

export interface FieldMeta<T = any> {
    name: keyof T;
    label: string;
    type?: 'text' | 'email' | 'tel' | 'textarea' | 'password' | 'number' | 'select' ;
    validators?: ValidatorFn[];
    placeholder?: string;
    validationMessages?: { [key: string]: string };
    options?: string[];
}