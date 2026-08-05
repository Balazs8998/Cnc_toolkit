import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-code-editor',
  imports: [ReactiveFormsModule],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditor {

  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly programSubmitted = output<string>();

  protected readonly programEditorForm = this.formBuilder.group({
    cncProgram: this.formBuilder.control('', Validators.required),
  });

  protected submitProgram(): void {
    console.log('submit')
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
