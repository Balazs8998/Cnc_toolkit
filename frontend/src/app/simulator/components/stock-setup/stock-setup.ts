import { Component, inject, output, SimpleChanges } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SimulationService } from '../../services/simulation.service';
import { StockSetupData } from '../../models/swiss-lateh-machine/simulator-models/stock-setup/stock-setup';
import { Position } from '../../models/swiss-lateh-machine/simulator-models/position';

@Component({
  selector: 'app-stock-setup',
  imports: [ReactiveFormsModule],
  templateUrl: './stock-setup.html',
  styleUrl: './stock-setup.css',
})
export class StockSetup {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  protected readonly simulation = inject(SimulationService);

  protected readonly stockSetupSubmitted = output<StockSetupData>();

  closeStockSetup = output<void>();

  protected readonly stockSetupForm = this.formBuilder.group({
    diameter: this.formBuilder.control(this.simulation.stockSetup().diameter, Validators.required),

    workLength: this.formBuilder.control(
      this.simulation.stockSetup().workLength,
      Validators.required,
    ),

    radialClearance: this.formBuilder.control(
      this.simulation.stockSetup().radialClearance,
      Validators.required,
    ),

    axialClearance: this.formBuilder.control(
      this.simulation.stockSetup().axialClearance,
      Validators.required,
    ),
  });

  protected submitStockSetup(): void {
    if (this.stockSetupForm.invalid) {
      return;
    }
    const stockSetup: StockSetupData = this.stockSetupForm.getRawValue();
    const currentPos : Position = {
      x: (stockSetup.diameter + stockSetup.radialClearance)/2,
      z: -stockSetup.axialClearance
    }

    this.simulation.stockSetup.set(stockSetup);
    this.closeStockSetup.emit();
    console.log(stockSetup);
    this.simulation.machineState.update(state => ({
      ...state,
      position: currentPos,
    }))

    // this.simulation.currentPosition.set(currentPos)

    this.simulation.movementStartPosition.set(currentPos)

  }
}
