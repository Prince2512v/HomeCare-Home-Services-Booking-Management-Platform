import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormGroup,AbstractControl,ControlContainer} from '@angular/forms';
import { AppValidators } from '@Validators';
import { EmailInputConfig } from './email.config';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email.html',
  styleUrls: ['./email.css'],
})
export class Email implements OnInit {
  @Input() config!: EmailInputConfig;

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

  get isInvalidEmail(): boolean {
    if (this.control?.hasError('required')) return true;
    const value = this.control?.value;
    if (!value) return false;
    return !!AppValidators.email({ value } as AbstractControl);
  }

  get isFloating(): boolean {
    return this.config?.floating === true;
  }

  onInput(event: Event): void {
    this.config?.onChange?.(event);
  }

  onBlur(event: FocusEvent): void {
    this.control?.markAsTouched();
    this.config?.onBlur?.(event);
  }
}