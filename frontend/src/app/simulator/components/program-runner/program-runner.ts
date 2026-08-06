import { ChangeDetectionStrategy, Component, inject, model, output } from '@angular/core';
import { SimulationService } from '../../services/simulation.service';
import { CodeLine } from '../../models/simulator-models/swiss-lateh-machine/codeLine';

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
