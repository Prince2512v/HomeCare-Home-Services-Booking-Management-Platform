import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { WeeklyRevenueModel } from '../models';

@Injectable({ providedIn: 'root' })
export class RevenueOverviewService {
  private apiService = inject(ApiService);

  getRevenue(period: string): Observable<ApiResponse<WeeklyRevenueModel[]>> {
    return this.apiService.get<WeeklyRevenueModel[]>(API_ROUTES.DASHBOARD.REVENUE_OVERVIEW, {
      period,
    });
  }
}
