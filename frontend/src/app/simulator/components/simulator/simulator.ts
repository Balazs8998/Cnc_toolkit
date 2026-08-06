import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CodeEditor } from '../code-editor/code-editor';

import { CanvasView } from '../canvas-view/canvas-view';
import { SimulationService } from '../../services/simulation.service';
import { ProgramRunner } from '../program-runner/program-runner';

type SimulatorVeiw = 'editor' | 'runner';

@Component({
  selector: 'app-simulator',
  imports: [CodeEditor, CanvasView, ProgramRunner],
  providers: [SimulationService],
  templateUrl: './simulator.html',
  styleUrl: './simulator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class Simulator {



  protected readonly simulation = inject(SimulationService);
  protected readonly activeView = signal<SimulatorVeiw>('editor');



  protected loadProgram(program: string): void {
    this.simulation.loadProgram(program);
    this.activeView.set('runner');
  }

  protected openEditor(): void {
    this.activeView.set('editor');
  }
}
