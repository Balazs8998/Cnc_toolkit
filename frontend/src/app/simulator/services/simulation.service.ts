import { inject, Service, signal } from '@angular/core';
import { GCodeParserService } from './g-code-parser.service';
import { CodeLine } from '../models/simulator-models/swiss-lateh-machine/codeLine';
import { MovementCalculatorService } from './movement-calculator.service';
import { MovePosition } from '../models/simulator-models/swiss-lateh-machine/move-position';
import { LinearMovementSegment } from '../models/simulator-models/swiss-lateh-machine/linear-movement-segment';


@Service({
  autoProvided: false,
})
export class SimulationService {
  private readonly parser = inject(GCodeParserService);
  private readonly movementCalculator = inject(MovementCalculatorService);

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

  private readonly initialPosition: MovePosition = {
    x: -1,
    z: 0,
  };

  readonly completedMovements = signal<readonly LinearMovementSegment[]>([]);
  readonly movementStartPosition = signal<MovePosition>({
    ...this.initialPosition,
  });

  readonly currentPosition = signal<MovePosition>({
    ...this.initialPosition,
  });

  readonly movementProgress = signal(0);

  private readonly movementDurationMs = 2000;

  private animationFrameId: number | null = null;
  private movementStartedAt = 0;
  private elapsedMovementTime = 0;

  private activeMovementStart: MovePosition | null = null;
  private activeMovementTarget: MovePosition | null = null;

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
    this.activeMovementTarget = null;

    this.movementStartedAt = 0;
    this.elapsedMovementTime = 0;

    this.currentLineIndex.set(0);
    this.movementProgress.set(0);
    this.completedMovements.set([]);

    this.movementStartPosition.set({
      ...this.initialPosition,
    });

    this.currentPosition.set({
      ...this.initialPosition,
    });

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

    if (!currentLine.gCodes.includes(1)) {
      this.currentLineIndex.update((index) => index + 1);
      this.startMovement();
      return;
    }

    const startPosition = this.currentPosition();

    const movement = this.movementCalculator.calculateLinearMovement(currentLine, startPosition);

    const targetPosition: MovePosition = {
      x: startPosition.x + movement.x,
      z: startPosition.z + movement.z,
    };

    this.movementStartPosition.set(startPosition);

    this.activeMovementStart = startPosition;
    this.activeMovementTarget = targetPosition;

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

    this.currentPosition.set({
      x:
        this.activeMovementStart.x +
        (this.activeMovementTarget.x - this.activeMovementStart.x) * progress,

      z:
        this.activeMovementStart.z +
        (this.activeMovementTarget.z - this.activeMovementStart.z) * progress,
    });

    if (progress < 1) {
      this.animationFrameId = requestAnimationFrame(this.animateFrame);

      return;
    }

    this.completeMovement();
    if(this.codeLines().length === this.completedMovements().length){
      this.status.set('stopped')
    }
  };

  private resumeMovement(): void {
    if (this.activeMovementStart === null || this.activeMovementTarget === null) {
      return;
    }

    this.movementStartedAt = performance.now();
    this.status.set('running');

    this.animationFrameId = requestAnimationFrame(this.animateFrame);
  }

  private completeMovement(): void {
    const startPosition = this.activeMovementStart;
    const targetPosition = this.activeMovementTarget;

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

    this.currentPosition.set({ ...targetPosition });
    this.movementStartPosition.set({ ...targetPosition });

    this.animationFrameId = null;
    this.elapsedMovementTime = 0;

    this.activeMovementStart = null;
    this.activeMovementTarget = null;

    const nextLineIndex = this.currentLineIndex() + 1;

    if (nextLineIndex >= this.codeLines().length) {
      this.status.set('stopped');
      return;
    }

    this.currentLineIndex.set(nextLineIndex);
    this.startMovement();
  }

  private hasProgramChange() {
    this.hasProgram.update((value) => !value);
  }
}
