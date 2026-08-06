import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramRunner } from './program-runner';

describe('ProgramRunner', () => {
  let component: ProgramRunner;
  let fixture: ComponentFixture<ProgramRunner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramRunner],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramRunner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
