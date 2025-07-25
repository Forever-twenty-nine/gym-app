import { hasRol, rolToLabel } from './rol.helpers';
import { Rol } from '../enums/rol.enum';
import { ROL_OPTIONS } from '../constants/rol.options';

describe('rol.helpers', () => {
    describe('rolToLabel', () => {
        it('debería devolver el label correcto si el rol existe', () => {
            const result = rolToLabel(Rol.CLIENTE);
            const expected = ROL_OPTIONS.find(o => o.value === Rol.CLIENTE)?.label ?? '';
            expect(result).toBe('Cliente');
            expect(result).toBe(expected);
        });

        it('debería devolver el rol si no existe en ROL_OPTIONS', () => {
            const result = rolToLabel('superadmin' as Rol);
            expect(result).toBe('superadmin');
        });
    });

    describe('hasRol', () => {
        it('debería devolver true si el usuario tiene el rol', () => {
            const result = hasRol({ roles: [Rol.CLIENTE, Rol.ENTRENADOR] }, Rol.CLIENTE);
            expect(result).toBeTrue();
        });

        it('debería devolver false si el usuario no tiene el rol', () => {
            const result = hasRol({ roles: [Rol.GIMNASIO] }, Rol.ENTRENADOR);
            expect(result).toBeFalse();
        });

        it('debería manejar un usuario sin roles', () => {
            const result = hasRol({ roles: [] }, Rol.CLIENTE);
            expect(result).toBeFalse();
        });
    });
});
