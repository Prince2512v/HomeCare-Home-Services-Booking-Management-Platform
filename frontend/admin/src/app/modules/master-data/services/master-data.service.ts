import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import {
  DataQueryResponseModel,
  GetServiceTypeResponseModel,
  GetCategoryResponseModel,
  GetSubCategoryResponseModel,
  CreateCategoryRequestModel,
  CreateSubCategoryRequestModel,
} from '../models';

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private apiService = inject(ApiService);

  /* ================= SERVICE TYPES ================= */

  getServiceTypes(): Observable<ApiResponse<DataQueryResponseModel<GetServiceTypeResponseModel>>> {
    return this.apiService.get<DataQueryResponseModel<GetServiceTypeResponseModel>>(
      API_ROUTES.SERVICE_TYPE.GET_ALL
    );
  }

  getServiceTypeById(id: number): Observable<ApiResponse<GetServiceTypeResponseModel>> {
    return this.apiService.get<GetServiceTypeResponseModel>(
      this.apiService.buildEndpoint(API_ROUTES.SERVICE_TYPE.GET_BY_ID, id)
    );
  }

  createServiceType(formData: FormData): Observable<ApiResponse<GetServiceTypeResponseModel>> {
    return this.apiService.post<GetServiceTypeResponseModel>(API_ROUTES.SERVICE_TYPE.ADD, formData);
  }

  updateServiceType(
    id: number,
    formData: FormData
  ): Observable<ApiResponse<GetServiceTypeResponseModel>> {
    return this.apiService.put<GetServiceTypeResponseModel>(
      this.apiService.buildEndpoint(API_ROUTES.SERVICE_TYPE.UPDATE, id),
      formData
    );
  }

  deleteServiceType(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(
      this.apiService.buildEndpoint(API_ROUTES.SERVICE_TYPE.DELETE, id)
    );
  }

  getImageUrl(id: number): string {
    return `${this.apiService.baseUrl}${this.apiService.buildEndpoint(
      API_ROUTES.SERVICE_TYPE.IMAGE,
      id
    )}`;
  }

  /* ================= CATEGORY ================= */

  getCategoriesByServiceType(
    serviceTypeId: number
  ): Observable<ApiResponse<DataQueryResponseModel<GetCategoryResponseModel>>> {
    return this.apiService.get<DataQueryResponseModel<GetCategoryResponseModel>>(
      API_ROUTES.CATEGORY.GET,
      { serviceTypeId: String(serviceTypeId) }
    );
  }

  createCategory(
    request: CreateCategoryRequestModel
  ): Observable<ApiResponse<GetCategoryResponseModel>> {
    return this.apiService.post<GetCategoryResponseModel>(API_ROUTES.CATEGORY.ADD, request);
  }

  deleteCategory(id: number) {
    return this.apiService.delete<boolean>(
      this.apiService.buildEndpoint(API_ROUTES.CATEGORY.DELETE, id)
    );
  }
  /* ================= SUB CATEGORY ================= */

  getSubCategoriesByCategories(
    categoryId: number
  ): Observable<ApiResponse<DataQueryResponseModel<GetSubCategoryResponseModel>>> {
    return this.apiService.get<DataQueryResponseModel<GetSubCategoryResponseModel>>(
      API_ROUTES.SUB_CATEGORY.GET,
      { categoryId: String(categoryId) }
    );
  }

  createSubCategory(
    request: CreateSubCategoryRequestModel
  ): Observable<ApiResponse<GetSubCategoryResponseModel>> {
    return this.apiService.post<GetSubCategoryResponseModel>(API_ROUTES.SUB_CATEGORY.ADD, request);
  }

  deleteSubCategory(id: number) {
    return this.apiService.delete<boolean>(
      this.apiService.buildEndpoint(API_ROUTES.SUB_CATEGORY.DELETE, id)
    );
  }
}