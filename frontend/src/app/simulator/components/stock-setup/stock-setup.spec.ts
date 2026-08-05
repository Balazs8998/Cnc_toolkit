import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockSetup } from './stock-setup';

describe('StockSetup', () => {
  let component: StockSetup;
  let fixture: ComponentFixture<StockSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
