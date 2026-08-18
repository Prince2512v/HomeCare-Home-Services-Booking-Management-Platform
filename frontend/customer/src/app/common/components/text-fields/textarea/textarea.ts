import { Component, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextareaInputConfig } from './textarea.config';

@Component({
  selector: 'app-textarea',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './textarea.html',
  styleUrl: './textarea.css',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class Textarea {
  @Input() config!: TextareaInputConfig;

  get rows(): number {
    return this.config?.rows ?? 3;
  }
}