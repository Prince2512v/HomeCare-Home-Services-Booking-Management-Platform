import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { AppValidators } from '@Validators';
import { AddressConfig } from '@common';

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
  }

  get control(): AbstractControl {
    return this.formGroup.get(this.config.formControlName) as AbstractControl;
  }

  get isTouched(): boolean {
    return !!this.control?.touched;
  }

  get isInvalidAddress(): boolean {
    const value = this.control?.value;
    if (!value) return false;
    return !!AppValidators.address({ value } as AbstractControl);
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