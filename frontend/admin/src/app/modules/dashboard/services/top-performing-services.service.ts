import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { BookingByServiceTypeModel } from '../models';

@Injectable({ providedIn: 'root' })
export class TopPerformingServicesService {
  private apiService = inject(ApiService);

  getServiceTypeBookings(period: string): Observable<ApiResponse<BookingByServiceTypeModel[]>> {
    return this.apiService.get<BookingByServiceTypeModel[]>(
      API_ROUTES.DASHBOARD.TOP_PERFORMING_SERVICES,
      { period }
    );
  }
}
