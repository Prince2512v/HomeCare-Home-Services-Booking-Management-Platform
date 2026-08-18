import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mobilenumber',
})
export class MobileNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '' || value === '0000000000') {
      return 'No number added';
    }
    return `+61${value}`;
  }
}