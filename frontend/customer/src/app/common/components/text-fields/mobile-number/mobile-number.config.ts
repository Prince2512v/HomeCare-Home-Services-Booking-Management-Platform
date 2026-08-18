export interface MobileNumberConfig {
  formControlName: string;
  placeholder?: string;
  maxLength?: number;
  showRequired?: boolean;
  onChange?: (event?: any) => void;
  onBlur?: (event?: any) => void;
  floating?: boolean;
}
