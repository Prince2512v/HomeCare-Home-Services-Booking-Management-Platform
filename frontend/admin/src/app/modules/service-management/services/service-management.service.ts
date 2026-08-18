import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { environment } from '../../../../environments/environment';
import { GetServiceTypeResponseModel, GetCategoryResponseModel, GetSubCategoryResponseModel, DataQueryResponseModel, GetServicesListResponseModel, FilterServicesRequestModel, ServiceTypeFullDataModel, FilteredDataQueryResponseModel} from '../models/service-management.model';

@Injectable({ providedIn: 'root' })
export class ServiceManagementService {
  private api = inject(ApiService);

  getServiceTypes(): Observable<ApiResponse<DataQueryResponseModel<GetServiceTypeResponseModel>>> {
    return this.api.get<DataQueryResponseModel<GetServiceTypeResponseModel>>(
      API_ROUTES.SERVICE_TYPE.GET_ALL
    );
  }

  getCategoriesByServiceType(
    serviceTypeId: number
  ): Observable<ApiResponse<DataQueryResponseModel<GetCategoryResponseModel>>> {
    return this.api.get<DataQueryResponseModel<GetCategoryResponseModel>>(API_ROUTES.CATEGORY.GET, {
      serviceTypeId: String(serviceTypeId),
    });
  }

  getSubCategoriesByCategory(
    categoryId: number
  ): Observable<ApiResponse<DataQueryResponseModel<GetSubCategoryResponseModel>>> {
    return this.api.get<DataQueryResponseModel<GetSubCategoryResponseModel>>(
      API_ROUTES.SUB_CATEGORY.GET,
      { categoryId: String(categoryId) }
    );
  }

  getServicesBySubCategory(
    request: FilterServicesRequestModel
  ): Observable<ApiResponse<FilteredDataQueryResponseModel<GetServicesListResponseModel>>> {
    return this.api.post<FilteredDataQueryResponseModel<GetServicesListResponseModel>>(
      API_ROUTES.SERVICES.GET_ALL,
      request
    );
  }

  getFullDataByServiceType(
    serviceTypeId: number
  ): Observable<ApiResponse<ServiceTypeFullDataModel>> {
    return this.api.get<ServiceTypeFullDataModel>(
      this.api.buildEndpoint(API_ROUTES.SERVICES.BY_SERVICE_TYPE, serviceTypeId)
    );
  }

  toggleServiceAvailability(id: number, isAvailable: boolean): Observable<ApiResponse<boolean>> {
    return this.api.patch<boolean>(
      this.api.buildEndpoint(API_ROUTES.SERVICES.AVAILABILITY, id),
      isAvailable
    );
  }

  createService(formData: FormData): Observable<ApiResponse<any>> {
    return this.api.post<any>(API_ROUTES.SERVICES.ADD, formData);
  }

  updateService(id: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.api.put<any>(this.api.buildEndpoint(API_ROUTES.SERVICES.UPDATE, id), formData);
  }

  deleteService(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<any>(this.api.buildEndpoint(API_ROUTES.SERVICES.DELETE, id));
  }

  getServiceById(id: number): Observable<ApiResponse<any>> {
    return this.api.get<any>(this.api.buildEndpoint(API_ROUTES.SERVICES.GET_BY_ID, id)).pipe(
      map((res) => {
        if (res?.data?.images) {
          res.data.images = res.data.images.map((img: any) => ({
            ...img,
            imageUrl: img.imageUrl?.startsWith('http')
              ? img.imageUrl
              : `${environment.resourceUrl}${img.imageUrl}`,
          }));
        }
        return res;
      })
    );
  }

  getImageUrl(id: number): string {
    return this.api.baseUrl + this.api.buildEndpoint(API_ROUTES.SERVICE_TYPE.IMAGE, id);
  }
}