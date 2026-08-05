import { Service } from '@angular/core';
import { CodeLine } from '../models/simulator-models/swiss-lateh-machine/codeLine';

@Service()
export class GCodeParserService {

  parseProgram(program: string): CodeLine[] {
    const lines = program.split(/\r?\n/);

    return lines.filter((line) => line.trim().length > 0).map((line) => this.parseBlock(line));
  }

  private parseBlock(line: string): CodeLine {
    const codeBlocks = line.toUpperCase().trim().split(' ');

    const codeLine: CodeLine = {
      gCodes: [],
      mCodes: [],
      x: undefined,
      z: undefined,
      feed: undefined,
      rpm: undefined,
    };

    for (const codeBlock of codeBlocks) {
      if (codeBlock.length < 2) {
        continue;
      }

      const value = Number(codeBlock.slice(1));

      if (Number.isNaN(value)) {
        console.log('value is not a number');
      }

      switch (codeBlock[0]) {
        case 'G':
          codeLine.gCodes.push(value);
          break;

        case 'M':
          codeLine.mCodes.push(value);
          break;

        case 'X':
          codeLine.x = value;
          break;

        case 'Z':
          codeLine.z = value;
          break;

        case 'S':
          codeLine.rpm = value;
          break;

        case 'F':
          codeLine.feed = value;
          break;
      }
    }

    console.log(codeLine);

    return codeLine;
  }
}
