import { TestBed } from '@angular/core/testing';

import { PedidoStorageService } from './pedido-storage.service';

describe('PedidoStorageService', () => {
  let service: PedidoStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
