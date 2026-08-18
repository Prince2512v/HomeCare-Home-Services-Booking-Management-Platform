export interface DateInputConfig {
  formControlName: string;
  placeholder?: string;
  showCalendarIcon?: boolean;
  floating?: boolean;
  disableFuture?: boolean;
  minDate?: string;
  showRequired?: boolean;
  onChange?: (event?: any) => void;
  onBlur?: (event?: any) => void;
}