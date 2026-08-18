import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button, ButtonInputConfig } from '@common';
import { FilterPanelConfig, FilterFieldConfig, FilterValues } from './filter-panel.config';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
})
export class FilterPanel implements OnChanges {
  @Input() config!: FilterPanelConfig;
  @Input() isOpen = false;
  @Input() activeValues: Record<string, number | string | boolean | null> | null = null;

  fieldValues: Record<string, number | string | boolean | null> = {};

  private wasOpen = false;

  cancelConfig: ButtonInputConfig = {
    variant: 'close',
    text: 'Cancel',
    onClick: () => this.cancel(),
  };

  applyConfig: ButtonInputConfig = {
    variant: 'apply',
    text: 'Filter',
    onClick: () => this.applyFilter(),
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      const prev = changes['config'].previousValue as FilterPanelConfig | undefined;
      const curr = changes['config'].currentValue as FilterPanelConfig | undefined;
      const prevKeys = prev?.fields?.map((f) => f.key).join(',') ?? '';
      const currKeys = curr?.fields?.map((f) => f.key).join(',') ?? '';
      if (prevKeys !== currKeys) {
        this.initFieldValues();
      }
    }

    if (changes['isOpen']) {
      const opening = this.isOpen && !this.wasOpen;
      this.wasOpen = this.isOpen;
      if (opening) {
        this.initFieldValues(false);
      }
    }
  }

  private initFieldValues(reset = false): void {
    if (!this.config?.fields) return;
    const source = reset ? null : this.activeValues ?? null;
    const next: Record<string, number | string | boolean | null> = {};
    for (const field of this.config.fields) {
      if (field.type === 'price-range' || field.type === 'number-range') {
        next[`${field.key}_min`] = source?.[`${field.key}_min`] ?? field.min ?? 0;
        next[`${field.key}_max`] = source?.[`${field.key}_max`] ?? field.max ?? 1000;
      } else if (field.type === 'toggle') {
        next[field.key] = source?.[field.key] ?? field.defaultValue ?? false;
      } else if (field.type === 'select') {
        const raw = source?.[field.key] ?? field.defaultValue ?? '';
        next[field.key] = raw === true ? 'true' : raw === false ? 'false' : raw;
      } else {
        next[field.key] = source?.[field.key] ?? field.defaultValue ?? '';
      }
    }
    this.fieldValues = next;
  }

  getMin(field: FilterFieldConfig): number {
    return field.min ?? 0;
  }

  getMax(field: FilterFieldConfig): number {
    return field.max ?? 1000;
  }

  getMinVal(field: FilterFieldConfig): number {
    return (this.fieldValues[`${field.key}_min`] as number) ?? this.getMin(field);
  }

  getMaxVal(field: FilterFieldConfig): number {
    return (this.fieldValues[`${field.key}_max`] as number) ?? this.getMax(field);
  }

  getPrefix(field: FilterFieldConfig): string {
    if (field.prefix !== undefined) return field.prefix;
    return field.type === 'price-range' ? '$' : '';
  }

  onMinInput(field: FilterFieldConfig, e: Event): void {
    const val = +(e.target as HTMLInputElement).value;
    const max = this.getMaxVal(field);
    const clamped = val > max ? max : val;
    (e.target as HTMLInputElement).value = String(clamped);
    this.fieldValues = {
      ...this.fieldValues,
      [`${field.key}_min`]: clamped,
    };
  }

  onMaxInput(field: FilterFieldConfig, e: Event): void {
    const val = +(e.target as HTMLInputElement).value;
    const min = this.getMinVal(field);
    const clamped = val < min ? min : val;
    (e.target as HTMLInputElement).value = String(clamped);
    this.fieldValues = {
      ...this.fieldValues,
      [`${field.key}_max`]: clamped,
    };
  }

  fillPercent(field: FilterFieldConfig): number {
    const range = this.getMax(field) - this.getMin(field);
    return range > 0 ? ((this.getMinVal(field) - this.getMin(field)) / range) * 100 : 0;
  }

  emptyPercent(field: FilterFieldConfig): number {
    const range = this.getMax(field) - this.getMin(field);
    return range > 0 ? 100 - ((this.getMaxVal(field) - this.getMin(field)) / range) * 100 : 0;
  }

  emptyStartPercent(field: FilterFieldConfig): number {
    const range = this.getMax(field) - this.getMin(field);
    return range > 0 ? ((this.getMaxVal(field) - this.getMin(field)) / range) * 100 : 100;
  }

  getToggleVal(field: FilterFieldConfig): boolean {
    return (this.fieldValues[field.key] as boolean) ?? false;
  }

  onToggleChange(field: FilterFieldConfig, checked: boolean): void {
    this.fieldValues = { ...this.fieldValues, [field.key]: checked };
  }

  applyFilter(): void {
    const values: FilterValues = {};

    for (const field of this.config.fields) {
      if (field.type === 'price-range' || field.type === 'number-range') {
        const min = this.getMinVal(field);
        const max = this.getMaxVal(field);
        values[`${field.key}_min`] = min > (field.min ?? 0) ? min : null;
        values[`${field.key}_max`] = max < (field.max ?? 1000) ? max : null;
      } else if (field.type === 'toggle') {
        values[field.key] = this.getToggleVal(field);
      } else {
        const raw = this.fieldValues[field.key];
        if (raw === '' || raw === null || raw === undefined) {
          values[field.key] = null;
        } else if (raw === 'true') {
          values[field.key] = true;
        } else if (raw === 'false') {
          values[field.key] = false;
        } else {
          values[field.key] = raw;
        }
      }
    }

    this.config.onFilter(values);
  }

  cancel(): void {
    this.initFieldValues(true);
    this.config.onCancel();
  }

  reset(): void {
    this.initFieldValues(true);
  }
}