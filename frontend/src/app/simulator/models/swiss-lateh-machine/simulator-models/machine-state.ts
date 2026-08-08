import { Position } from './position';

export interface MachineState {
  position: Position;
  feed: number;
  rpm: number;
  activeGCodes: string[];
  activeMCodes: string[];
  activeLine: number;
  status: string;

}
