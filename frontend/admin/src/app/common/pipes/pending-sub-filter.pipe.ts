// pending-sub-filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pendingSubFilter'
})
export class PendingSubFilterPipe implements PipeTransform {
  transform(
    subs: { tempId: string; subCategoryName: string; categoryTempId?: string; categoryId?: number }[],
    categoryTempId?: string | null,
    categoryId?: number | null
  ): { tempId: string; subCategoryName: string; categoryTempId?: string; categoryId?: number }[] {
    if (!subs) return [];

    if (categoryTempId) {
      return subs.filter((s) => s.categoryTempId === categoryTempId);
    }

    if (categoryId) {
      return subs.filter((s) => s.categoryId === categoryId);
    }

    return [];
  }
}