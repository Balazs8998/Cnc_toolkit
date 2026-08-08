import { computed, inject, Service } from '@angular/core';
import { Position } from '../models/swiss-lateh-machine/simulator-models/position';
import { SimulationService } from './simulation.service';
import { LinearMovementSegment } from '../models/swiss-lateh-machine/simulator-models/linear-movement-segment';

@Service({
  autoProvided: false,
})
export class CanvasRendererService {
  private readonly simulation = inject(SimulationService);
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;

  private readonly xMin = computed(() => {
    const stock = this.simulation.stockSetup();
    if(stock.diameter < 20){
      return -2 ;
    }else {
      return -5
    }
  });

  private readonly xMax = computed(() => {
    const stock = this.simulation.stockSetup();
    return (stock.diameter + stock.radialClearance +8) / 2;
  });

  private readonly zMin = computed(() => {
    const stock = this.simulation.stockSetup();
    if (stock.workLength < 20) {
      return -5;
    } else {
      return -10;
    }
  });

  private readonly zMax = computed(() => {
    const stock = this.simulation.stockSetup();
    return stock.workLength + stock.axialClearance;  });


  private readonly padding = 5;



  private readonly startPosition: Position = {
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

  private drawLinearMovement(startPosition: Position, targetPosition: Position): void {
    if (this.context === null) {
      return;
    }
    const radialStartPos: Position = {
      x: startPosition.x / 2,
      z: startPosition.z,
    };
    const radialTargetPos: Position = {
      x: targetPosition.x / 2,
      z: targetPosition.z,
    };

    const start = this.machineToCanvas(radialStartPos);
    const target = this.machineToCanvas(radialTargetPos);

    this.context.beginPath();
    this.context.moveTo(start.pixelX, start.pixelY);
    this.context.lineTo(target.pixelX, target.pixelY);

    this.context.lineWidth = 3;
    this.context.strokeStyle = '#6565e6';
    this.context.stroke();
  }

  drawMovementFrame(
    completedMovements: readonly LinearMovementSegment[],
    startPosition: Position,
    currentPosition: Position,
  ): void {
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

  private machineToCanvas(position: Position): {
    pixelX: number;
    pixelY: number;
  } {
    if (this.canvas === null) {
      throw new Error('Canvas has not been initialized.');
    }

    const xRange = this.xMax() - this.xMin();
    const zRange = this.zMax() - this.zMin();

    const availableWidth = this.canvas.width - this.padding * 2;
    const availableHeight = this.canvas.height - this.padding * 2;

    const scale = Math.min(availableWidth / zRange, availableHeight / xRange);

    const drawingWidth = zRange * scale;
    const drawingHeight = xRange * scale;

    const offsetX = (this.canvas.width - drawingWidth) / 2;

    const offsetY = (this.canvas.height - drawingHeight) / 2;

    return {
      pixelX: offsetX + (position.z - this.zMin()) * scale,
      pixelY: offsetY + (this.xMax() - position.x) * scale,
    };
  }

   drawCoordinateSystem(): void {
    if (this.canvas === null || this.context === null) {
      return;
    }

    const zNegativeEnd = this.machineToCanvas({
      x: 0,
      z: this.zMin(),
    });

    const zPositiveEnd = this.machineToCanvas({
      x: 0,
      z: this.zMax(),
    });

    const xNegativeEnd = this.machineToCanvas({
      x: this.xMin(),
      z: 0,
    });

    const xPositiveEnd = this.machineToCanvas({
      x: this.xMax(),
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

  private drawTool(position: Position): void {
    if (this.context === null) {
      return;
    }

    const radialPosition : Position = {
      x: position.x / 2,
      z: position.z,
    }

    const point = this.machineToCanvas(radialPosition);

    this.context.beginPath();

    this.context.arc(point.pixelX, point.pixelY, 4, 0, Math.PI * 2);

    this.context.fillStyle = '#d32f2f';
    this.context.fill();
  }
}
