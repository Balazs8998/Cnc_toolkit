import { Service } from '@angular/core';
import { CodeLine } from '../models/swiss-lateh-machine/simulator-models/codeLine';
import { MovePosition } from '../models/swiss-lateh-machine/simulator-models/move-position';

@Service()
export class MovementCalculatorService {

  calculateLinearMovement(line: CodeLine, currentPosition: MovePosition): MovePosition {
    let xValue: number;
    let zValue: number;

    if (line.x === undefined) {
      xValue = 0;
    } else {
      xValue = line.x - currentPosition.x;
    }

    if (line.z === undefined) {
      zValue = 0;
    } else {
      zValue = line.z - currentPosition.z;
    }

    const movementDelta: MovePosition = {
      x: 0,
      z: 0,
    };

    movementDelta.x = xValue;
    movementDelta.z = zValue;

    return movementDelta;
  }
}
