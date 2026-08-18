export interface ButtonInputConfig {
  type?: 'button' | 'submit' | 'reset';
  variant: 'save' | 'close' | 'add' | 'delete' | 'toggle' | 'filter' | 'apply'|'edit';
  cssClass?: string;
  text?: string;
  isLoading?: boolean;
  disabled?: boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  onClick?: (event?: any) => void;
}

export const BUTTON_VARIANTS: Record<string, { text: string; class: string }> = {
  save: { text: 'Save', class: 'btn-save' },
  close: { text: 'Close', class: 'btn-cancle' },
  add: { text: '+ Add', class: 'btn-add' },
  delete: { text: 'Delete', class: 'btn-delete' },
  toggle: { text: '', class: 'btn-toggle' },
  filter: { text: 'Filter', class: 'btn-filter' },
  apply: { text: 'Apply', class: 'btn-apply' },
  edit: { text: 'Edit', class: 'btn-edit' },
};