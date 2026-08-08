import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild
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

  readonly currentPos = computed(() => {
    const target = this.simulation.activeMovementTarget();

    if (target === null) {
      return { x: 0, z: 0 };
    }

    return {
      x: target.x,
      z: target.z,
    };
  });

  readonly distanceToGo = computed(() => {
    const target = this.simulation.activeMovementTarget();

    if (target === null) {
      return { x: 0, z: 0 };
    }

    return {
      x: target.x - this.simulation.machineState().position.x,
      z: target.z - this.simulation.machineState().position.z,
    };
  });

  readonly rpm = computed(() => {
    return this.simulation.machineState().rpm;
  });

  readonly feed = computed(() => {
    return this.simulation.machineState().feed;
  });

  readonly activeGcodes = computed(() => {
    return this.simulation.machineState().activeGCodes;
  });

  readonly activeMcodes = computed(() => {
    return this.simulation.machineState().activeMCodes;
  });

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

        const currentPosition = this.simulation.machineState().position;

        this.renderer.drawMovementFrame(completedMovements, startPosition, currentPosition);
      },
    });
  }
}


