import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasView } from './canvas-view';

describe('CanvasView', () => {
  let component: CanvasView;
  let fixture: ComponentFixture<CanvasView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasView],
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
