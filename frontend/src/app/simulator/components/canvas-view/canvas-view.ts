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

@Component({
  selector: 'app-canvas-view',
  providers: [CanvasRendererService],
  templateUrl: './canvas-view.html',
  styleUrl: './canvas-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasView {

  private readonly renderer = inject(CanvasRendererService);
  private readonly simulation = inject(SimulationService);

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
        const codeLines = this.simulation.codeLines();

        this.renderer.drawProgram(codeLines);
      }
    })

  }
}
