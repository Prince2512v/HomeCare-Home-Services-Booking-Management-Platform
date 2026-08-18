import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  AbstractControl,
  ControlContainer,
} from '@angular/forms';
import { AppValidators } from '@Validators';
import { DateInputConfig } from './date.config';

@Component({
  selector: 'app-date',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './date.html',
  styleUrls: ['./date.css'],
})
export class DateInput implements OnInit {
  @Input() config!: DateInputConfig;

  @ViewChild('nativeDatePicker')
  nativeDatePicker!: ElementRef<HTMLInputElement>;

  formGroup!: FormGroup;
  isFocused = false;
  private controlContainer = inject(ControlContainer);

  get todayStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  get minDateStr(): string {
    const raw = this.config?.minDate;
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const parts = raw.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  }
  private checkMinDate(val: string): void {
    if (!this.config?.minDate || !val) return;
    const parts = val.split('-');
    if (parts.length !== 3 || parts[2].length !== 4) return;
    const entered = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const minStr = this.minDateStr;
    if (!minStr) return;
    const min = new Date(minStr);
    if (!isNaN(entered.getTime()) && !isNaN(min.getTime()) && entered < min) {
      const existing = { ...(this.control?.errors || {}) };
      existing['beforeMinDate'] = true;
      this.control?.setErrors(existing);
    } else {
      const existing = { ...(this.control?.errors || {}) };
      delete existing['beforeMinDate'];
      this.control?.setErrors(Object.keys(existing).length ? existing : null);
    }
  }

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

  get isFloating(): boolean {
    return this.config?.floating === true;
  }

  get isInvalidDate(): boolean {
    const value = this.control?.value;
    if (!value) return false;
    return !!AppValidators.date({ value } as AbstractControl);
  }

  onKeyDown(e: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      '-',
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  onInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/[^0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
    if (val.length > 10) val = val.slice(0, 10);
    input.value = val;
    this.control?.setValue(val, { emitEvent: true });
    this.checkMinDate(val);
    this.config?.onChange?.(e);
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(e: FocusEvent): void {
    this.isFocused = false;
    this.control?.markAsTouched();
    this.checkMinDate(this.control?.value || '');
    this.config?.onBlur?.(e);
  }

  openDatePicker(): void {
    const el = this.nativeDatePicker?.nativeElement;
    if (!el) return;
    try {
      el.showPicker?.();
    } catch {
      el.click();
    }
  }

  onDateSelected(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    if (!value) return;
    const [y, m, d] = value.split('-');
    const formatted = `${d}-${m}-${y}`;
    this.control.setValue(formatted);
    this.control.markAsTouched();
    this.checkMinDate(formatted);
  }
}
