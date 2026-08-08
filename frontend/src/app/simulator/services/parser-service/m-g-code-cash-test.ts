import { Service } from '@angular/core';
import { Gcode } from '../../models/swiss-lateh-machine/simulator-models/gcode';
import { Mcode } from '../../models/swiss-lateh-machine/simulator-models/mcode';

@Service()
export class MGCodeCashTest {

   readonly gCodeCache: Gcode[] = [
    {
      gCode: 'G0',
      behavior: 'MODAL',
      modalGroup: 'Move',
    },
     {
      gCode: 'G1',
      behavior: 'MODAL',
      modalGroup: 'Move',
    },
  ];

   readonly mCodeCache: Mcode[] = [
    {
      mCode: 'M3',
      behavior: 'MODAL',
      modalGroup: 'Spindle',
    },
    {
      mCode: 'M4',
      behavior: 'MODAL',
      modalGroup: 'Spindle',
    },
    {
      mCode: 'M5',
      behavior: 'MODAL',
      modalGroup: 'Spindle',
    },
  ];
}
