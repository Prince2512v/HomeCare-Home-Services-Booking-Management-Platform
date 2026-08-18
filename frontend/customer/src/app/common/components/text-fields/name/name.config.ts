export interface NameInputConfig {
  formControlName: string;
  placeholder?: string;
  floating?: boolean;
  showRequired?: boolean;
  onChange?: (event?: any) => void;
  onBlur?: (event?: any) => void;
}