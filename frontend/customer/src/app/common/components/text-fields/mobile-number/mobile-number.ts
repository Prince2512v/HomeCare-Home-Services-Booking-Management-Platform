import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { MobileNumberConfig } from './mobile-number.config';

@Component({
  selector: 'app-mobile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mobile-number.html',
  styleUrls: ['./mobile-number.css'],
})
export class MobileNumber implements OnInit {
  @Input() config!: MobileNumberConfig;

  formGroup!: FormGroup;
  private controlContainer = inject(ControlContainer);

  ngOnInit(): void {
    this.formGroup = this.controlContainer.control as FormGroup;
  }

  get control(): AbstractControl {
    return this.formGroup.get(this.config.formControlName) as AbstractControl;
  }

  get isTouched(): boolean {
    return !!this.control?.touched;
  }

  get isInvalidMobile(): boolean {
    return !!this.control?.invalid;
  }

  get isFloating(): boolean {
    return this.config?.floating === true;
  }

  onInput(e: Event): void {
    this.config?.onChange?.(e);
  }

  onBlur(e: FocusEvent): void {
    this.control?.markAsTouched();
    this.config?.onBlur?.(e);
  }
}
