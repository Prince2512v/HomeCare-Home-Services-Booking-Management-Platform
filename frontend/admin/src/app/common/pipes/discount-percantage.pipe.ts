import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discount'
})
export class DiscountPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    return `${value}% off`;
  }

}