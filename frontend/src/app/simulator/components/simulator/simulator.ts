import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CodeEditor } from '../code-editor/code-editor';

import { CanvasView } from '../canvas-view/canvas-view';
import { SimulationService } from '../../services/simulation.service';

@Component({
  selector: 'app-simulator',
  imports: [
    CodeEditor,
    CanvasView,
  ],
  providers: [SimulationService],
  templateUrl: './simulator.html',
  styleUrl: './simulator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Simulator {

  private readonly  simulation = inject(SimulationService);

  protected  loadProgram(program: string): void {
    this.simulation.loadProgram(program);
  }


}
