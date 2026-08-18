import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idFormat',
  standalone: true,
})
export class IdFormat implements PipeTransform {
  transform(value: number | null | undefined, minDigits: number = 3): string {
    if (value === null) return '';
    return String(value).padStart(minDigits, '0');
  }
}