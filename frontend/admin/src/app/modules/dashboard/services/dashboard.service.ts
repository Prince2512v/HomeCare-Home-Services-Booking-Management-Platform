import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import {
  MetricCardModel,
  WeeklyRevenueModel,
  CityBookingsModel,
  BookingByServiceTypeModel,
  TopServicePartnerModel,
} from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiService = inject(ApiService);

  getTotalServicesBooked(): Observable<ApiResponse<MetricCardModel>> {
    return this.apiService.get<MetricCardModel>(API_ROUTES.DASHBOARD.CARD_TOTAL_SERVICES_BOOKED, {
      period: 'year',
    });
  }

  getActiveUsers(): Observable<ApiResponse<MetricCardModel>> {
    return this.apiService.get<MetricCardModel>(API_ROUTES.DASHBOARD.CARD_ACTIVE_USERS);
  }

  getActiveServicePartners(): Observable<ApiResponse<MetricCardModel>> {
    return this.apiService.get<MetricCardModel>(API_ROUTES.DASHBOARD.CARD_ACTIVE_SERVICE_PARTNERS);
  }

  getTotalRevenue(): Observable<ApiResponse<MetricCardModel>> {
    return this.apiService.get<MetricCardModel>(API_ROUTES.DASHBOARD.CARD_TOTAL_REVENUE, {
      period: 'year',
    });
  }

  getRevenue(period: string): Observable<ApiResponse<WeeklyRevenueModel[]>> {
    return this.apiService.get<WeeklyRevenueModel[]>(API_ROUTES.DASHBOARD.REVENUE_OVERVIEW, {
      period,
    });
  }

  getCityBookings(period: string): Observable<ApiResponse<CityBookingsModel>> {
    return this.apiService.get<CityBookingsModel>(API_ROUTES.DASHBOARD.CITY_BOOKINGS_CHART, {
      period,
    });
  }

  getServiceTypeBookings(period: string): Observable<ApiResponse<BookingByServiceTypeModel[]>> {
    return this.apiService.get<BookingByServiceTypeModel[]>(
      API_ROUTES.DASHBOARD.TOP_PERFORMING_SERVICES,
      { period }
    );
  }

  getAllTopServicePartners(): Observable<ApiResponse<TopServicePartnerModel[]>> {
    return this.apiService.get<TopServicePartnerModel[]>(
      API_ROUTES.DASHBOARD.TOP_SERVICE_PARTNERS,
      { top: '5' }
    );
  }
}