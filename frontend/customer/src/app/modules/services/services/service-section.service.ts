import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { ServiceTypeWithTotalBooking } from '@ServiceSectionModels';

@Injectable({ providedIn: 'root' })
export class ServicesSectionService {
  private api = inject(ApiService);

  getServiceTypes(): Observable<ServiceTypeWithTotalBooking[]> {
    return this.api
      .get<ServiceTypeWithTotalBooking[]>(API_ROUTES.SERVICE.SERVICE_TYPES_WITH_BOOKING_COUNT)
      .pipe(map((response) => response.data));
  }
}