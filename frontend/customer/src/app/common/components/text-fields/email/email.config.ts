export interface EmailInputConfig {
  formControlName: string;
  placeholder?: string;
  floating?: boolean;
  showRequired?: boolean;
  onChange?: (event?: any) => void;
  onBlur?: (event?: any) => void;
}