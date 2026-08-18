export interface FilterOption {
  value: number | string | boolean;
  label: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type:
    | 'select'
    | 'price-range'
    | 'number-range'
    | 'text'
    | 'date'
    | 'time'
    | 'toggle'
    | 'text-with-suffix';

  options?: FilterOption[];
  placeholder?: string;

  min?: number;
  max?: number;
  prefix?: string;
  step?: number;

  suffix?: string;
  icon?: string;
  defaultValue?: number | string | boolean | null;
}

export type FilterValues = Record<string, number | string | boolean | null>;

export interface FilterPanelConfig {
  title?: string;
  fields: FilterFieldConfig[];
  onFilter: (values: FilterValues) => void;
  onCancel: () => void;
}