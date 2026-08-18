import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { CityBookingsModel } from '../models';

@Injectable({ providedIn: 'root' })
export class TopCitiesService {
  private apiService = inject(ApiService);

  getCityBookings(period: string): Observable<ApiResponse<CityBookingsModel>> {
    return this.apiService.get<CityBookingsModel>(API_ROUTES.DASHBOARD.CITY_BOOKINGS_CHART, {
      period,
    });
  }
}
