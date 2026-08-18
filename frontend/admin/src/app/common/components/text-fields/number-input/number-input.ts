import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { RequiredFieldDirective } from '@directives';
import { NumberInputConfig } from './number-input.config';

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RequiredFieldDirective],
  templateUrl: './number-input.html',
  styleUrls: ['./number-input.css'],
})
export class NumberInput implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() config!: NumberInputConfig;

  private controlContainer = inject(ControlContainer);

  ngOnInit(): void {
    if (this.controlContainer?.control) {
      this.formGroup = this.controlContainer.control as FormGroup;
    }
  }

  get control(): AbstractControl | null {
    return this.formGroup?.get(this.config.formControlName) || null;
  }

  get isTouched(): boolean {
    return !!this.control?.touched;
  }

  get errors(): ValidationErrors | null {
    return this.control?.errors || null;
  }
}
