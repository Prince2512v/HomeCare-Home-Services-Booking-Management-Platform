import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { NameInputConfig } from '@common';

@Component({
  selector: 'app-name',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './name.html',
  styleUrls: ['./name.css'],
})
export class Name implements OnInit {
  @Input() config!: NameInputConfig;

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

  get isInvalidName(): boolean {
    return !!this.control?.errors;
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