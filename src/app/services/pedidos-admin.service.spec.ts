import { TestBed } from '@angular/core/testing';

import { PedidosAdminService } from './pedidos-admin.service';

describe('PedidosAdminService', () => {
  let service: PedidosAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidosAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
