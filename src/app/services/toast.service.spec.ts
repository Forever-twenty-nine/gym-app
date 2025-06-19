import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should set and clear mensaje when mostrar is called', fakeAsync(() => {
    service.mostrar('hi', 1000);
    expect(service.mensaje()).toBe('hi');
    tick(1000);
    expect(service.mensaje()).toBe('');
  }));
});
