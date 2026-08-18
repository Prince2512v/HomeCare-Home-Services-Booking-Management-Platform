import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appliedCount'
})
export class AppliedCountPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    if (value < 1000) {
      return `${value} times`;
    }

    if (value < 1_000_000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K times`;
    }

    if (value < 1_000_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M times`;
    }

    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B times`;
  }
}