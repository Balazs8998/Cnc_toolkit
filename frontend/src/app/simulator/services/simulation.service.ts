import { computed, inject, Service, signal } from '@angular/core';
import { GCodeParserService } from './g-code-parser.service';
import { CodeLine } from '../models/swiss-lateh-machine/simulator-models/code-line';
import { MovementCalculatorService } from './movement-calculator.service';
import { Position } from '../models/swiss-lateh-machine/simulator-models/position';
import { LinearMovementSegment } from '../models/swiss-lateh-machine/simulator-models/linear-movement-segment';
import { MachineState } from '../models/swiss-lateh-machine/simulator-models/machine-state';
import { Gcode } from '../models/swiss-lateh-machine/simulator-models/gcode';
import { Mcode } from '../models/swiss-lateh-machine/simulator-models/mcode';
import { MGCodeCashTest } from './parser-service/m-g-code-cash-test';

@Service({
  autoProvided: false,
})
export class SimulationService {
  //test
  private readonly testChase = inject(MGCodeCashTest);
  //test

  private readonly parser = inject(GCodeParserService);
  private readonly movementCalculator = inject(MovementCalculatorService);

  private readonly movementDurationMs = 2000;

  private animationFrameId: number | null = null;
  private movementStartedAt = 0;
  private elapsedMovementTime = 0;

  private activeMovementStart: Position | null = null;
  activeMovementTarget = signal<Position | null>(null);

  readonly codeLines = signal<readonly CodeLine[]>([]);
  readonly currentLineIndex = signal(0);
  readonly hasProgram = signal(false);
  readonly rawProgram = signal('');
  readonly status = signal('ready');
  readonly parserStatus = signal(false);

  readonly stockSetup = signal({
    diameter: 0,
    workLength: 0,
    radialClearance: 0,
    axialClearance: 0,
  });

  private readonly initialPosition = computed<Position>((): Position => {
    const pos: Position = {
      x: (this.stockSetup().diameter + this.stockSetup().axialClearance) / 2,
      z: -this.stockSetup().axialClearance,
    };
    return pos;
  });

  readonly completedMovements = signal<readonly LinearMovementSegment[]>([]);

  readonly machineState = signal<MachineState>({
    position: { x: this.initialPosition().x, z: this.initialPosition().z },
    rpm: 0,
    feed: 0,
    activeGCodes: new Set<Gcode>(),
    activeMCodes: new Set<Mcode>(),
    activeLine: this.currentLineIndex(),
    status: this.status(),
  });

  readonly movementStartPosition = signal({
    ...this.initialPosition(),
  });

  readonly movementProgress = signal(0);

  loadProgram(program: string): void {
    const parsedCodeLines = this.parser.parseProgram(program);

    this.rawProgram.set(program);
    this.codeLines.set(parsedCodeLines);
    this.hasProgramChange();
    this.currentLineIndex.set(0);
  }

  start(): void {
    if (this.status() === 'paused') {
      this.resumeMovement();
      this.status.set('running');
      return;
    }

    this.startMovement();
    this.status.set('running');
  }

  pause(): void {
    if (this.status() !== 'running') {
      return;
    }

    this.elapsedMovementTime += performance.now() - this.movementStartedAt;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.status.set('paused');
  }

  stop(): void {
    this.status.set('stopped');
  }

  reset(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.activeMovementStart = null;
    this.activeMovementTarget.set(null);

    this.movementStartedAt = 0;
    this.elapsedMovementTime = 0;

    this.currentLineIndex.set(0);
    this.movementProgress.set(0);
    this.completedMovements.set([]);

    this.movementStartPosition.set({
      ...this.initialPosition(),
    });

    this.machineState.update((state) => ({
      ...state,
      position: { x: this.initialPosition().x, z: this.initialPosition().z },
    }));

    this.status.set('ready');
  }

  parserStatusChange() {
    this.parserStatus.update((value) => !value);
  }

  private startMovement(): void {
    if (!this.parserStatus()) {
      return;
    }

    const currentLine = this.codeLines()[this.currentLineIndex()];

    if (!currentLine) {
      this.status.set('stopped');
      return;
    }

    if (!currentLine.gCodes.includes(1) && !currentLine.gCodes.includes(0)) {
      this.currentLineIndex.update((index) => index + 1);
      this.startMovement();
      return;
    }

    const startPosition = this.machineState().position;

    if (currentLine.rpm !== undefined) {
      const rpm = currentLine.rpm;
      this.machineState.update((state) => ({
        ...state,
        rpm: rpm,
      }));
    }
    if (currentLine.feed !== undefined) {
      const feed = currentLine.feed;
      this.machineState.update((state) => ({
        ...state,
        feed: feed,
      }));
    }

    this.updateActiveCodesFromLine(currentLine);


    const movement = this.movementCalculator.calculateLinearMovement(currentLine, startPosition);

    const targetPosition: Position = {
      x: startPosition.x + movement.x,
      z: startPosition.z + movement.z,
    };

    this.movementStartPosition.set(startPosition);

    this.activeMovementStart = startPosition;
    this.activeMovementTarget.set(targetPosition);

    this.elapsedMovementTime = 0;
    this.movementStartedAt = performance.now();
    this.movementProgress.set(0);

    this.status.set('running');

    this.animationFrameId = requestAnimationFrame(this.animateFrame);
  }

  private readonly animateFrame = (currentTime: number): void => {
    if (
      this.status() !== 'running' ||
      this.activeMovementStart === null ||
      this.activeMovementTarget === null
    ) {
      return;
    }

    const currentRunTime = currentTime - this.movementStartedAt;

    const totalElapsedTime = this.elapsedMovementTime + currentRunTime;

    const progress = Math.min(totalElapsedTime / this.movementDurationMs, 1);

    this.movementProgress.set(progress);

    const target = this.activeMovementTarget();

    if (this.status() !== 'running' || target === null) {
      return;
    }

    const xPos = this.activeMovementStart.x + (target.x - this.activeMovementStart.x) * progress;

    const zPos = this.activeMovementStart.z + (target.z - this.activeMovementStart.z) * progress;

    this.machineState.update((state) => ({
      ...state,
      position: {
        x: xPos,
        z: zPos,
      },
    }));

    if (progress < 1) {
      this.animationFrameId = requestAnimationFrame(this.animateFrame);

      return;
    }

    this.completeMovement();

    if (this.codeLines().length === this.completedMovements().length) {
      this.status.set('stopped');
    }
  };

  private resumeMovement(): void {
    if (this.activeMovementStart === null || this.activeMovementTarget() === null) {
      return;
    }

    this.movementStartedAt = performance.now();
    this.status.set('running');

    this.animationFrameId = requestAnimationFrame(this.animateFrame);
  }

  private completeMovement(): void {
    const startPosition = this.activeMovementStart;
    const targetPosition = this.activeMovementTarget();

    if (startPosition === null || targetPosition === null) {
      return;
    }

    this.completedMovements.update((movements) => [
      ...movements,
      {
        startPosition: { ...startPosition },
        endPosition: { ...targetPosition },
      },
    ]);

    this.machineState.update((state) => ({
      ...state,
      position: {
        x: targetPosition.x,
        z: targetPosition.z,
      },
    }));

    this.movementStartPosition.set({ ...targetPosition });

    this.animationFrameId = null;
    this.elapsedMovementTime = 0;

    this.activeMovementStart = null;
    this.activeMovementTarget.set(null);

    const nextLineIndex = this.currentLineIndex() + 1;

    if (nextLineIndex >= this.codeLines().length) {
      this.status.set('stopped');
      this.machineState.update((state) => ({
        ...state,
        rpm: 0,
      }));
      this.machineState.update((state) => ({
        ...state,
        feed: 0,
      }));
      return;
    }

    this.currentLineIndex.set(nextLineIndex);
    this.startMovement();
  }

  private hasProgramChange() {
    this.hasProgram.update((value) => !value);
  }


  private updateActiveCodesFromLine(currentLine: CodeLine): void {
    this.machineState.update((state) => {
      const updatedGCodes = new Set(state.activeGCodes);
      const updatedMCodes = new Set(state.activeMCodes);

      // Az előző sor BLOCK_ONLY kódjai már nem aktívak.
      for (const activeGCode of updatedGCodes) {
        if (activeGCode.behavior === 'BLOCK_ONLY') {
          updatedGCodes.delete(activeGCode);
        }
      }

      for (const activeMCode of updatedMCodes) {
        if (activeMCode.behavior === 'BLOCK_ONLY') {
          updatedMCodes.delete(activeMCode);
        }
      }

      // Aktuális G-kódok feldolgozása.
      for (const gCodeValue of currentLine.gCodes) {
        const gCode = this.testChase.gCodeCache.find(
          (code) => Number(code.gCode.slice(1)) === gCodeValue,
        );

        if (gCode === undefined) {
          continue;
        }

        if (gCode.behavior === 'MODAL' && gCode.modalGroup !== undefined) {
          for (const activeGCode of updatedGCodes) {
            if (activeGCode.modalGroup === gCode.modalGroup) {
              updatedGCodes.delete(activeGCode);
            }
          }
        }

        updatedGCodes.add(gCode);
      }

      // Aktuális M-kódok feldolgozása.
      for (const mCodeValue of currentLine.mCodes) {
        const mCode = this.testChase.mCodeCache.find(
          (code) => Number(code.mCode.slice(1)) === mCodeValue,
        );

        if (mCode === undefined) {
          continue;
        }

        if (mCode.behavior === 'MODAL') {
          for (const activeMCode of updatedMCodes) {
            if (activeMCode.modalGroup === mCode.modalGroup) {
              updatedMCodes.delete(activeMCode);
            }
          }
        }

        updatedMCodes.add(mCode);
      }

      return {
        ...state,
        activeGCodes: updatedGCodes,
        activeMCodes: updatedMCodes,
      };
    });
  }
}
