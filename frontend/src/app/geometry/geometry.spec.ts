import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Geometry } from './geometry';

describe('Geometry', () => {
  let component: Geometry;
  let fixture: ComponentFixture<Geometry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Geometry],
    }).compileComponents();

    fixture = TestBed.createComponent(Geometry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
