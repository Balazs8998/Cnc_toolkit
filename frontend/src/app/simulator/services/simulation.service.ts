import { inject, Service, signal } from '@angular/core';
import { GCodeParserService } from './g-code-parser.service';
import { CodeLine } from '../models/simulator-models/swiss-lateh-machine/codeLine';

@Service({
  autoProvided: false,
})
export class SimulationService {

  private readonly parser = inject(GCodeParserService);

  readonly codeLines = signal<readonly CodeLine[]>([]);

  loadProgram(program: string): void {
    const parsedCodeLines = this.parser.parseProgram(program);

    this.codeLines.set(parsedCodeLines);
  }
}
