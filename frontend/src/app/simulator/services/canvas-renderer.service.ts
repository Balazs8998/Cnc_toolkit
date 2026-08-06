import { inject, Service } from '@angular/core';
import { MovePosition } from '../models/simulator-models/swiss-lateh-machine/move-position';
import { CodeLine } from '../models/simulator-models/swiss-lateh-machine/codeLine';
import { SimulationService } from './simulation.service';
import { LinearMovementSegment } from '../models/simulator-models/swiss-lateh-machine/linear-movement-segment';

// kérdés

@Service({
  autoProvided: false,
})
export class CanvasRendererService {
  private readonly simulation = inject(SimulationService);
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;

  private readonly xMin = -40;
  private readonly xMax = 100;
  private readonly zMin = -40;
  private readonly zMax = 100;
  private readonly padding = 20;
  private readonly startPosition: MovePosition = {
    x: 0,
    z: 0,
  };

  initialize(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');

    if (context === null) {
      throw new Error('Canvas context could not be created.');
    }

    this.canvas = canvas;
    this.context = context;

    this.drawCoordinateSystem();
    this.drawTool(this.startPosition);
  }

  drawProgram(codeLines: readonly CodeLine[]): void {
    if (this.canvas === null || this.context === null) {
      return;
    }

    let currentPosition: MovePosition = {
      x: -1,
      z: 0,
    };

    this.drawCoordinateSystem();
    this.drawTool(currentPosition);

    for (const line of codeLines) {
      if (!line.gCodes.includes(1)) {
        continue;
      }

      const targetPosition: MovePosition = {
        x: line.x ?? currentPosition.x,
        z: line.z ?? currentPosition.z,
      };

      this.drawLinearMovement(currentPosition, targetPosition);

      currentPosition = targetPosition;
    }
  }

  private drawLinearMovement(startPosition: MovePosition, targetPosition: MovePosition): void {
    if (this.context === null) {
      return;
    }

    const start = this.machineToCanvas(startPosition);
    const target = this.machineToCanvas(targetPosition);

    this.context.beginPath();
    this.context.moveTo(start.pixelX, start.pixelY);
    this.context.lineTo(target.pixelX, target.pixelY);

    this.context.lineWidth = 3;
    this.context.strokeStyle = '#6565e6';
    this.context.stroke();
  }

  drawMovementFrame(completedMovements : readonly LinearMovementSegment[],
                    startPosition: MovePosition,
                    currentPosition: MovePosition): void {
    if (this.canvas === null || this.context === null) {
      return;
    }

    this.drawCoordinateSystem();

    for (const movement of completedMovements) {
      this.drawLinearMovement(movement.startPosition, movement.endPosition);
    }

    this.drawLinearMovement(startPosition, currentPosition);
    this.drawTool(currentPosition);
  }

  private machineToCanvas(position: MovePosition): {
    pixelX: number;
    pixelY: number;
  } {
    if (this.canvas === null) {
      throw new Error('Canvas has not been initialized.');
    }

    const xRange = this.xMax - this.xMin;
    const zRange = this.zMax - this.zMin;

    const availableWidth = this.canvas.width - this.padding * 2;

    const availableHeight = this.canvas.height - this.padding * 2;

    const scale = Math.min(availableWidth / zRange, availableHeight / xRange);

    const drawingWidth = zRange * scale;
    const drawingHeight = xRange * scale;

    const offsetX = (this.canvas.width - drawingWidth) / 2;

    const offsetY = (this.canvas.height - drawingHeight) / 2;

    return {
      pixelX: offsetX + (position.z - this.zMin) * scale,
      pixelY: offsetY + (this.xMax - position.x) * scale,
    };
  }

  private drawCoordinateSystem(): void {
    if (this.canvas === null || this.context === null) {
      return;
    }

    const zNegativeEnd = this.machineToCanvas({
      x: 0,
      z: this.zMin,
    });

    const zPositiveEnd = this.machineToCanvas({
      x: 0,
      z: this.zMax,
    });

    const xNegativeEnd = this.machineToCanvas({
      x: this.xMin,
      z: 0,
    });

    const xPositiveEnd = this.machineToCanvas({
      x: this.xMax,
      z: 0,
    });

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.beginPath();

    this.context.moveTo(zNegativeEnd.pixelX, zNegativeEnd.pixelY);

    this.context.lineTo(zPositiveEnd.pixelX, zPositiveEnd.pixelY);

    this.context.moveTo(xNegativeEnd.pixelX, xNegativeEnd.pixelY);

    this.context.lineTo(xPositiveEnd.pixelX, xPositiveEnd.pixelY);

    this.context.lineWidth = 1;
    this.context.strokeStyle = '#777';
    this.context.stroke();

    this.context.lineWidth = 1;
    this.context.strokeStyle = '#777';

    this.context.fillStyle = '#dddddd';
    this.context.font = '14px sans-serif';

    this.context.fillText('Z+', zPositiveEnd.pixelX - 20, zPositiveEnd.pixelY - 10);

    this.context.fillText('Z-', zNegativeEnd.pixelX, zNegativeEnd.pixelY - 10);

    this.context.fillText('X+', xPositiveEnd.pixelX + 8, xPositiveEnd.pixelY + 15);

    this.context.fillText('X-', xNegativeEnd.pixelX + 8, xNegativeEnd.pixelY);
  }

  private drawTool(position: MovePosition): void {
    if (this.context === null) {
      return;
    }

    const point = this.machineToCanvas(position);

    this.context.beginPath();

    this.context.arc(point.pixelX, point.pixelY, 4, 0, Math.PI * 2);

    this.context.fillStyle = '#d32f2f';
    this.context.fill();
  }
}
