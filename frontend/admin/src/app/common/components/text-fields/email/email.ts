import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { EmailInputConfig } from '@common';
import { RequiredFieldDirective } from '@directives';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RequiredFieldDirective],
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