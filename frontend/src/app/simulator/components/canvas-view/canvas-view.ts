import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { CanvasRendererService } from '../../services/canvas-renderer.service';
import { SimulationService } from '../../services/simulation.service';
import { Controls } from '../controls/controls';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-canvas-view',
  providers: [CanvasRendererService],
  templateUrl: './canvas-view.html',
  styleUrl: './canvas-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Controls, DecimalPipe],
})
export class CanvasView {
  private readonly renderer = inject(CanvasRendererService);
  private readonly simulation = inject(SimulationService);

  readonly currentPos = this.simulation.movementStartPosition;
  readonly distanceToGo = this.simulation.currentPosition;

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('cncCanvas');

  constructor() {
    afterNextRender({
      write: () => {
        const canvas = this.canvasRef().nativeElement;

        this.renderer.initialize(canvas);
      },
    });

    afterRenderEffect({
      write: () => {
        const completedMovements = this.simulation.completedMovements();

        const startPosition = this.simulation.movementStartPosition();

        const currentPosition = this.simulation.currentPosition();

        this.renderer.drawMovementFrame(completedMovements, startPosition, currentPosition);
      },
    });
  }
}


