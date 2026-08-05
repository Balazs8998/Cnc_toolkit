import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuttingData } from './cutting-data';

describe('CuttingData', () => {
  let component: CuttingData;
  let fixture: ComponentFixture<CuttingData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuttingData],
    }).compileComponents();

    fixture = TestBed.createComponent(CuttingData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
