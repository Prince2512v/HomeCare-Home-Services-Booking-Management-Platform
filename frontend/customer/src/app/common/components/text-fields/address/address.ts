import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  AbstractControl,
  ControlContainer,
} from '@angular/forms';
import { AppValidators } from '@Validators';
import { AddressConfig } from './address.config';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address.html',
  styleUrls: ['./address.css'],
})
export class Address implements OnInit {
  @Input() config!: AddressConfig;
  formGroup!: FormGroup;
  private controlContainer = inject(ControlContainer);

  ngOnInit(): void {
    this.formGroup = this.controlContainer.control as FormGroup;

    const ctrl = this.control;
    if (ctrl) {
      ctrl.addValidators(AppValidators.address);
      ctrl.updateValueAndValidity();
    }
  }

  get control(): AbstractControl {
    return this.formGroup.get(this.config.formControlName) as AbstractControl;
  }

  get isTouched(): boolean {
    return !!this.control?.touched;
  }

  get isInvalid(): boolean {
    return this.isTouched && !!this.control?.invalid;
  }

  get isFloating(): boolean {
    return this.config?.floating === true;
  }

  onInput(e: Event): void {
    this.config?.onChange?.(e);
  }
  get isInvalidAddress(): boolean {
    return this.control?.invalid && this.control?.touched;
  }
  onBlur(e: FocusEvent): void {
    this.control?.markAsTouched();
    this.config?.onBlur?.(e);
  }
}
