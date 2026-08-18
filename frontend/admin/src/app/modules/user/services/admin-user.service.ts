import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import {
  GetAdminUserResponseModel,
  CreateAdminUserRequestModel,
  UpdateAdminUserRequestModel,
  ChangeAdminUserPasswordRequestModel,
  FilterAdminUserRequestModel,
  PagedResult,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private apiService = inject(ApiService);

  getAdminUsers(
    filter: FilterAdminUserRequestModel
  ): Observable<ApiResponse<PagedResult<GetAdminUserResponseModel>>> {
    const params: Record<string, string> = {};
    if (filter.pageNumber != null) params['pageNumber'] = String(filter.pageNumber);
    if (filter.pageSize != null) params['pageSize'] = String(filter.pageSize);
    if (filter.isSuperAdmin != null) params['isSuperAdmin'] = String(filter.isSuperAdmin);
    if (filter.isActive != null) params['isActive'] = String(filter.isActive);
    if (filter.sortField) params['sortField'] = filter.sortField;
    if (filter.sortDirection) params['sortDirection'] = filter.sortDirection;
    return this.apiService.get<PagedResult<GetAdminUserResponseModel>>(
      API_ROUTES.ADMIN_USER.LIST,
      params
    );
  }

  getAdminUserById(id: number): Observable<ApiResponse<GetAdminUserResponseModel>> {
    return this.apiService.get<GetAdminUserResponseModel>(
      this.apiService.buildEndpoint(API_ROUTES.ADMIN_USER.BY_ID, id)
    );
  }

  createAdminUser(
    request: CreateAdminUserRequestModel
  ): Observable<ApiResponse<GetAdminUserResponseModel>> {
    return this.apiService.post<GetAdminUserResponseModel>(API_ROUTES.ADMIN_USER.CREATE, request);
  }

  updateAdminUser(
    id: number,
    request: UpdateAdminUserRequestModel
  ): Observable<ApiResponse<GetAdminUserResponseModel>> {
    return this.apiService.put<GetAdminUserResponseModel>(
      this.apiService.buildEndpoint(API_ROUTES.ADMIN_USER.UPDATE, id),
      request
    );
  }

  deleteAdminUser(id: number): Observable<ApiResponse<boolean>> {
    return this.apiService.delete<boolean>(
      this.apiService.buildEndpoint(API_ROUTES.ADMIN_USER.DELETE, id)
    );
  }

  changeAdminUserPassword(
    request: ChangeAdminUserPasswordRequestModel
  ): Observable<ApiResponse<null>> {
    return this.apiService.patch<null>(API_ROUTES.ADMIN_USER.CHANGE_PASSWORD, request);
  }
}