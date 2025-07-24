import { UserService } from './user.service';
import { Rol } from '../enums/rol.enum';
import { User } from '../models/user.model';
import { TestBed } from '@angular/core/testing';

describe('UserService con signals, computed y effect', () => {
    let service: UserService;

    // Mock de usuario para usar en múltiples tests
    const usuarioMock: User = {
        uid: 'abc123',
        nombre: 'Sebas',
        email: 'sebas@mail.com',
        onboarded: true,
        roles: [Rol.CLIENTE]
    };

    // Se ejecuta antes de cada test
    beforeEach(() => {
        // Limpia el localStorage antes de cada prueba
        localStorage.clear();

        // Inicializa el inyector de Angular para tener contexto válido
        TestBed.configureTestingModule({});

        // Creamos la instancia del servicio dentro del contexto de inyección
        TestBed.runInInjectionContext(() => {
            service = new UserService();
        });
    });

    it('restaura usuario válido desde localStorage', () => {
        // Guardamos un usuario válido en localStorage
        localStorage.setItem('usuario', JSON.stringify(usuarioMock));

        // Reinstanciamos el servicio para que lea desde localStorage
        TestBed.runInInjectionContext(() => {
            service = new UserService();
        });

        // Verificamos que haya restaurado correctamente
        expect(service.getUsuarioActual()).toEqual(usuarioMock);
        expect(service.estaLogueado()).toBeTrue();
    });

    it('ignora usuario inválido en localStorage', () => {
        // Guardamos un string inválido (JSON roto)
        localStorage.setItem('usuario', '{invalid json');

        // Reinstanciamos el servicio dentro del contexto Angular
        TestBed.runInInjectionContext(() => {
            service = new UserService();
        });

        // Verificamos que lo haya ignorado y limpiado
        expect(service.getUsuarioActual()).toBeNull();
    });

    it('computed estaLogueado debe ser true con usuario', () => {
        // Cargamos un usuario válido
        service.setUsuario(usuarioMock);

        // Leemos el signal (necesario para activar effect)
        service.usuario();

        // Confirmamos que el estado logueado esté en true
        expect(service.estaLogueado()).toBeTrue();
    });

    it('computed rolesLegibles debe devolver etiquetas', () => {
        // Establecemos el usuario
        service.setUsuario(usuarioMock);

        // Activamos lectura del signal
        service.usuario();

        // rolesLegibles usa rolToLabel internamente
        const roles = service.rolesLegibles();
        expect(roles).toContain('Cliente');
    });

    it('el efecto guarda en localStorage si el usuario tiene onboarded', async () => {
        // Asignamos el usuario
        service.setUsuario(usuarioMock);

        // Activamos el signal para disparar el effect
        service.usuario();

        // Esperamos al microtask para que el effect se dispare
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));

        // Verificamos que localStorage fue actualizado
        const stored = localStorage.getItem('usuario');
        expect(stored).toContain('"uid":"abc123"');
    });

    it('el efecto no guarda si onboarded es false', async () => {
        const user = { ...usuarioMock, onboarded: false };

        service.setUsuario(user);
        service.usuario(); // dispara el effect

        await Promise.resolve();

        // No debe haber nada guardado
        expect(localStorage.getItem('usuario')).toBeNull();
    });

    it('logout limpia el usuario y el storage', async () => {
        service.setUsuario(usuarioMock);
        service.logout(); // ejecuta set(null)

        service.usuario(); // dispara el efecto
        await Promise.resolve();

        // Todo debería estar limpio
        expect(service.getUsuarioActual()).toBeNull();
        expect(localStorage.getItem('usuario')).toBeNull();
    });

    it('cambiarNombre actualiza solo el nombre', () => {
        service.setUsuario(usuarioMock);

        // Cambiamos solo el nombre del usuario
        service.cambiarNombre('NuevoNombre');

        // Verificamos que el resto quede igual
        expect(service.getUsuarioActual()?.nombre).toBe('NuevoNombre');
    });
});
