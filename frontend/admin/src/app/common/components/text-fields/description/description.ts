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
import { DescriptionFieldConfig } from './description.config';

@Component({
  selector: 'app-description-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RequiredFieldDirective],
  templateUrl: './description.html',
  styleUrls: ['./description.css'],
})
export class Description implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() config!: DescriptionFieldConfig;

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