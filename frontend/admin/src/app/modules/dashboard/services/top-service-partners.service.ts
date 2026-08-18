import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { TopServicePartnerModel } from '../models';

@Injectable({ providedIn: 'root' })
export class TopServicePartnersService {
  private apiService = inject(ApiService);

  getAllTopServicePartners(): Observable<ApiResponse<TopServicePartnerModel[]>> {
    return this.apiService.get<TopServicePartnerModel[]>(
      API_ROUTES.DASHBOARD.TOP_SERVICE_PARTNERS,
      { top: '100' }
    );
  }
}
