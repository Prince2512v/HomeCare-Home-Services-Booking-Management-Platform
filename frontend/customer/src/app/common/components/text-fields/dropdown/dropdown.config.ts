export interface DropdownOption {
  label: string;
  value: any;
}

export interface DropdownInputConfig {
  formControlName: string;
  placeholder?: string;
  options: DropdownOption[];
  requiredMsg?: string;
  onChange?: (event?: any) => void;
  onBlur?: (event?: any) => void;
}
