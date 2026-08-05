import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockSetup } from '../stock-setup/stock-setup';

@Component({
  selector: 'app-code-editor',
  imports: [ReactiveFormsModule, StockSetup],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditor {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly programSubmitted = output<string>();
  protected readonly isStockSetupOpen = signal(false);

  protected toggleStockSetup(): void {
    this.isStockSetupOpen.update((isOpen) => !isOpen);
  }

  protected readonly programEditorForm = this.formBuilder.group({
    cncProgram: this.formBuilder.control('', Validators.required),
  });

  protected submitProgram(): void {
    console.log('submit');
    if (this.programEditorForm.invalid) {
      return;
    }

    const program = this.programEditorForm.controls.cncProgram.value.trim();

    if (program.length === 0) {
      return;
    }

    this.programSubmitted.emit(program);
  }
}
