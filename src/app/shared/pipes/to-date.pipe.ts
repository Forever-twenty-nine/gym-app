import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte un Date o un Firestore Timestamp a Date para usar con el pipe date de Angular.
 * Uso: {{ fecha | toDate | date:'short' }}
 */
@Pipe({ name: 'toDate', standalone: true })
export class ToDatePipe implements PipeTransform {
  transform(value: any): Date | null {
    if (!value) return null;
    // Firestore Timestamp
    if (typeof value === 'object' && typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
    // Date
    if (value instanceof Date) {
      return value;
    }
    // String que puede ser parseada
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
    return null;
  }
}
