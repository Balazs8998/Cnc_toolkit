import { Component, inject } from '@angular/core';
import { SimulationService } from '../../services/simulation.service';

@Component({
  selector: 'app-controls',
  imports: [],
  templateUrl: './controls.html',
  styleUrl: './controls.css',
})
export class Controls {
  protected readonly simulation = inject(SimulationService);

  start(): void {
    this.simulation.start();
  }

  pause(): void {
    this.simulation.pause();
  }

  stop(): void {
    this.simulation.stop();
  }

  reset(): void {
    this.simulation.reset();
  }
}
