import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { AppValidators } from '@Validators';
import { PasswordInputConfig } from '@common';
import { RequiredFieldDirective } from '@directives';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RequiredFieldDirective],
  templateUrl: './password.html',
  styleUrls: ['./password.css'],
})
export class Password implements OnInit {
  @Input() config!: PasswordInputConfig;

  formGroup!: FormGroup;
  showPassword = false;

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

  get isInvalidPassword(): boolean {
    const value = this.control?.value;
    if (!value) return !!this.control?.invalid;
    return !!AppValidators.password({ value } as AbstractControl);
  }

  get isFloating(): boolean {
    return this.config?.floating === true;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(e: Event): void {
    this.config?.onChange?.(e);
  }

  onBlur(e: FocusEvent): void {
    this.control?.markAsTouched();
    this.config?.onBlur?.(e);
  }
}