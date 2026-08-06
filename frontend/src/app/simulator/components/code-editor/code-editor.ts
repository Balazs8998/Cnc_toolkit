import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockSetup } from '../stock-setup/stock-setup';
import { SimulationService } from '../../services/simulation.service';

@Component({
  selector: 'app-code-editor',
  imports: [ReactiveFormsModule, StockSetup],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditor {
  // gép típus vezérlő beállítás mentése signalba hogy ha becsukod és kinyitod ne kelljen újra írni

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly simulation = inject(SimulationService);

  readonly programSubmitted = output<string>();
  protected readonly isStockSetupOpen = signal(false);

  protected toggleStockSetup(): void {
    this.isStockSetupOpen.update((isOpen) => !isOpen);
  }

  protected readonly programEditorForm = this.formBuilder.group({
    cncProgram: this.formBuilder.control(this.simulation.rawProgram(), Validators.required),
  });

   clearEditor() {
     this.programEditorForm.controls.cncProgram.setValue('');
     this.simulation.rawProgram.set('');
  }

  protected submitProgram(): void {
    console.log('submit');
    if (this.programEditorForm.invalid) {
      return;
    }

    const program = this.programEditorForm.controls.cncProgram.value.trim().toUpperCase();

    if (program.length === 0) {
      return;
    }

    this.programSubmitted.emit(program);
    this.simulation.parserStatusChange();
  }
}
