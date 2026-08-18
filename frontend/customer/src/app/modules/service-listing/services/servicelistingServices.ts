import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import {
  ServiceTypeWithCategories,
  ServiceListResponse,
  ServiceSearchResult,
} from '../models/servicelistingmodels';

@Injectable({ providedIn: 'root' })
export class ServiceListingService {
  private apiService = inject(ApiService);

  getServiceTypeWithCategories(
    serviceTypeId: number,
  ): Observable<ApiResponse<ServiceTypeWithCategories>> {
    return this.apiService.get<ServiceTypeWithCategories>(
      API_ROUTES.SERVICE_LISTING.SERVICE_TYPE,
      { serviceTypeId: serviceTypeId.toString() },
    );
  }

  getServicesBySubCategory(
    subCategoryId: number,
  ): Observable<ApiResponse<ServiceListResponse>> {
    return this.apiService.get<ServiceListResponse>(
      API_ROUTES.SERVICE_LISTING.SUBCATEGORY,
      { subCategoryId: subCategoryId.toString() },
    );
  }

  searchServices(
    serviceTypeId: number,
    term?: string,
  ): Observable<ApiResponse<ServiceSearchResult[]>> {
    const params: Record<string, string> = {
      serviceTypeId: serviceTypeId.toString(),
    };
    if (term && term.trim()) {
      params['term'] = term.trim();
    }
    return this.apiService.get<ServiceSearchResult[]>(
      API_ROUTES.SERVICE_LISTING.SERVICES,
      params,
    );
  }
}