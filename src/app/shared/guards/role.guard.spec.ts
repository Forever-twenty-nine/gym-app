import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { Rol } from '../enums/rol.enum';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

describe('roleGuard', () => {
    let mockRouter: jasmine.SpyObj<Router>;
    let mockUserService: jasmine.SpyObj<UserService>;

    beforeEach(() => {
        mockRouter = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
        mockUserService = jasmine.createSpyObj<UserService>('UserService', ['usuario']);

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: UserService, useValue: mockUserService },
            ]
        });
    });

    it('redirige al login si no hay usuario', () => {
        const fakeTree = {} as UrlTree;
        mockUserService.usuario.and.returnValue(null);
        mockRouter.createUrlTree.and.returnValue(fakeTree);

        TestBed.runInInjectionContext(() => {
            const result = roleGuard([Rol.CLIENTE])({} as any, {} as any);
            expect(result).toBe(fakeTree);
            expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
        });
    });

    it('redirige al onboarding si no tiene rol permitido', () => {
        const fakeTree = {} as UrlTree;
        const usuarioMock: User = {
            uid: '123',
            nombre: 'Test',
            email: 'test@mail.com',
            roles: [Rol.ENTRENADOR]
        };
        mockUserService.usuario.and.returnValue(usuarioMock);
        mockRouter.createUrlTree.and.returnValue(fakeTree);

        TestBed.runInInjectionContext(() => {
            const result = roleGuard([Rol.CLIENTE])({} as any, {} as any);
            expect(result).toBe(fakeTree);
            expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/onboarding']);
        });
    });

    it('permite el acceso si el usuario tiene el rol permitido', () => {
        const usuarioMock: User = {
            uid: '123',
            nombre: 'Test',
            email: 'test@mail.com',
            roles: [Rol.CLIENTE]
        };
        mockUserService.usuario.and.returnValue(usuarioMock);

        TestBed.runInInjectionContext(() => {
            const result = roleGuard([Rol.CLIENTE])({} as any, {} as any);
            expect(result).toBeTrue();
            expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
        });
    });
});
