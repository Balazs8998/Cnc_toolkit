import { Service } from '@angular/core';
import { CodeLine } from '../models/swiss-lateh-machine/simulator-models/code-line';

@Service()
export class GCodeParserService {
  parseProgram(program: string): CodeLine[] {
    return program
      .split(/\r?\n/)
      .map((line, index) => ({
        line,
        fileLineNumber: index + 1,
      }))
      .filter(({ line }) => line.trim().length > 0)
      .map(({ line, fileLineNumber }) => this.parseBlock(line, fileLineNumber));
  }

  private parseBlock(line: string, fileLineNumber: number): CodeLine {
    const codeBlocks = line.toUpperCase().trim().split(/\s+/);

    const codeLine: CodeLine = {
      fileLineNumber,
      blockNumber: undefined,
      sourceText: line,

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
        case 'N':
          codeLine.blockNumber = value;
          break;
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
          codeLine.rpm = Number(codeBlock.slice(3));

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
