import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { AllService, PopularService, ServiceNames, ServiceTypes,DashboardCounts } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private apiService = inject(ApiService);

  getServices(): Observable<ApiResponse<ServiceNames[]>> {
    return this.apiService.get<ServiceNames[]>(API_ROUTES.HOME.SERVICE_NAMES);
  }

  getServiceTypes(): Observable<ApiResponse<ServiceTypes[]>> {
    return this.apiService.get<ServiceTypes[]>(API_ROUTES.HOME.SERVICE_TYPES);
  }

  getPopularServices(): Observable<ApiResponse<PopularService[]>> {
    return this.apiService.get<PopularService[]>(API_ROUTES.HOME.POPULAR);
  }

  getAllServices(): Observable<ApiResponse<AllService[]>> {
    return this.apiService.get<AllService[]>(API_ROUTES.HOME.ALL_SERVICES);
  }

  getDashboardCounts(): Observable<ApiResponse<DashboardCounts>> {
    return this.apiService.get<DashboardCounts>(API_ROUTES.HOME.COUNTS);
  }
}
