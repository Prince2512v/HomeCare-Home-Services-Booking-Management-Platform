import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formateCount',
})
export class FormateCountPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) return '0';

    if (value >= 1_000_000) {
      return this.format(value, 1_000_000) + 'M+';
    } else if (value >= 1_000) {
      return this.format(value, 1_000) + 'K+';
    }

    return value.toString();
  }

  private format(value: number, divisor: number): string {
    const result = value / divisor;
    const floored = Math.floor(result * 10) / 10;
    return floored % 1 === 0 ? floored.toFixed(0) : floored.toFixed(1);
  }
}