export interface EmailInputConfig {
  formControlName: string;
  placeholder?: string;
  onChange?: (event?: any) => void;
  onBlur?: (event?: any) => void;
  floating?: boolean;
}
