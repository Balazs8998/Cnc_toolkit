import { Position } from './position';
import { Gcode } from './gcode';
import { Mcode } from './mcode';

export interface MachineState {
  position: Position;
  feed: number;
  rpm: number;
  activeGCodes: Set<Gcode>;
  activeMCodes: Set<Mcode>;
  activeLine: number;
  status: string;

}
