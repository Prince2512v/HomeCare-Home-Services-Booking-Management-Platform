export interface PasswordInputConfig {
  formControlName: string;
  placeholder?: string;
  floating?: boolean;
  onChange?: (event?: any) => void;
  onBlur?: (event?: any) => void;
}
