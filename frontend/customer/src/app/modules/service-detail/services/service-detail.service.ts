import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { ServiceDetail } from '../models/service-detail.model';

@Injectable({ providedIn: 'root' })
export class ServiceDetailService {
  private apiService = inject(ApiService);

  getServiceDetail(id: number): Observable<ApiResponse<ServiceDetail>> {
    return this.apiService.get<ServiceDetail>(API_ROUTES.SERVICES.DETAIL(id));
  }
}