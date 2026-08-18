export interface ButtonInputConfig {
  type?: 'button' | 'submit' | 'reset';
  text: string;
  cssClass: string;
  iconType?: 'filter' | 'edit';
  isLoading?: boolean;
  disabled?: boolean;
  isToggle?: boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  onClick?: (event?: any) => void;
}