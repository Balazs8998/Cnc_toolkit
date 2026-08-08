import { BehaviorType } from '../../types/behavior-type';
import { ModalGroup } from '../../types/modal-group';

export interface Gcode {
  gCode: string;
  behavior: BehaviorType;
  modalGroup: ModalGroup | undefined;
}
