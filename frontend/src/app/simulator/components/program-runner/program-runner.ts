import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  viewChildren,
} from '@angular/core';
import { SimulationService } from '../../services/simulation.service';
import { CodeLine } from '../../models/swiss-lateh-machine/simulator-models/code-line';

@Component({
  selector: 'app-program-runner',
  imports: [],
  templateUrl: './program-runner.html',
  styleUrl: './program-runner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramRunner {
  protected readonly simulation = inject(SimulationService);
  readonly editRequested = output<void>();

  private readonly programLines = viewChildren<ElementRef<HTMLElement>>('programLine');

  constructor() {
    afterRenderEffect({
      write: () => {
        const currentIndex = this.simulation.currentLineIndex();

        const lines = this.programLines();

        lines[currentIndex]?.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      },
    });
  }

  protected instructionText(line: CodeLine): string {
    if (line.blockNumber === undefined) {
      return line.sourceText;
    }

    return line.sourceText.replace(/^\s*N\d+\s*/i, '');
  }

  protected editProgram(): void {
    this.simulation.parserStatusChange();
    this.simulation.reset();
    this.editRequested.emit();
  }
}
