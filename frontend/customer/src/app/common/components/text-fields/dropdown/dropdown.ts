import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { DropdownInputConfig } from './dropdown.config';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dropdown.html',
  styleUrls: ['./dropdown.css'],
})
export class Dropdown implements OnInit {
  @Input() config!: DropdownInputConfig;

  formGroup!: FormGroup;
  isOpen = false;

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

  get isInvalid(): boolean {
    return this.isTouched && !!this.control?.invalid;
  }

  get hasValue(): boolean {
    const v = this.control?.value;
    return v !== null && v !== undefined && v !== '';
  }

  get selectedLabel(): string {
    if (!this.hasValue) return this.config.placeholder || 'Select';
    const found = this.config.options?.find((o) => o.value === this.control?.value);
    return found?.label ?? this.config.placeholder ?? 'Select';
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.control?.markAsTouched();
  }

  selectOption(opt: { label: string; value: any }): void {
    this.control.setValue(opt.value);
    this.control.markAsTouched();
    this.isOpen = false;
    this.config?.onChange?.(opt.value);
  }

  onBlur(e: FocusEvent): void {
    this.control?.markAsTouched();
    this.config?.onBlur?.(e);
  }
}
