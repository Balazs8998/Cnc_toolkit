import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chipbreak } from './chipbreak';

describe('Chipbreak', () => {
  let component: Chipbreak;
  let fixture: ComponentFixture<Chipbreak>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chipbreak],
    }).compileComponents();

    fixture = TestBed.createComponent(Chipbreak);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
