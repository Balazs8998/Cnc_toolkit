import { TestBed } from '@angular/core/testing';

import { MGCodeCashTest } from './m-g-code-cash-test';

describe('MGCodeCashTest', () => {
  let service: MGCodeCashTest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MGCodeCashTest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
