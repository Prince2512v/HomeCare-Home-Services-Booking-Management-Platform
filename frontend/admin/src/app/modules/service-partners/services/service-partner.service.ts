import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { HttpClient } from '@angular/common/http';
import {
  GetServicePartnerResponseModel,
  FilterServicePartnerRequestModel,
  DataQueryResponseModel,
  ServicePartnerDetailResponse,
  ServicePartnerActionResponse,
  AssignedServiceResponse,
  FilterAssignedServicesRequestModel,
} from '../models/service-partner.model';

@Injectable({ providedIn: 'root' })
export class ServicePartnerService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  getServicePartners(
    pageNumber: number,
    pageSize: number,
    filter?: FilterServicePartnerRequestModel
  ): Observable<ApiResponse<DataQueryResponseModel<GetServicePartnerResponseModel>>> {
    const params: Record<string, string> = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    };

    if (filter) {
      Object.keys(filter).forEach((key) => {
        const val = (filter as any)[key];
        if (val !== null && val !== undefined && val !== '') {
          params[key] = String(val);
        }
      });
    }

    return this.api.get<DataQueryResponseModel<GetServicePartnerResponseModel>>(
      API_ROUTES.SERVICE_PARTNER.LIST,
      params
    );
  }

  getServicePartnerDetail(id: number): Observable<ApiResponse<ServicePartnerDetailResponse>> {
    return this.api.get<ServicePartnerDetailResponse>(
      this.api.buildEndpoint(API_ROUTES.SERVICE_PARTNER.GET_BY_ID, id)
    );
  }

  approveServicePartner(id: number): Observable<ApiResponse<ServicePartnerActionResponse>> {
    return this.api.patch<ServicePartnerActionResponse>(
      this.api.buildEndpoint(API_ROUTES.SERVICE_PARTNER.APPROVE, id),
      {}
    );
  }

  rejectServicePartner(
    id: number,
    reason?: string
  ): Observable<ApiResponse<ServicePartnerActionResponse>> {
    return this.api.patch<ServicePartnerActionResponse>(
      this.api.buildEndpoint(API_ROUTES.SERVICE_PARTNER.REJECT, id),
      { rejectionReason: reason ?? null }
    );
  }
  getAssignedServices(
    id: number,
    filter: FilterAssignedServicesRequestModel
  ): Observable<ApiResponse<DataQueryResponseModel<AssignedServiceResponse>>> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        params[key] = String(val);
      }
    });

    return this.api.get<DataQueryResponseModel<AssignedServiceResponse>>(
      this.api.buildEndpoint(API_ROUTES.SERVICE_PARTNER.ASSIGNED_SERVICES, id),
      params
    );
  }

  toggleServicePartnerStatus(id: number): Observable<ApiResponse<boolean>> {
    return this.api.patch<boolean>(
      this.api.buildEndpoint(API_ROUTES.SERVICE_PARTNER.TOGGLE_STATUS, id),
      {}
    );
  }

  deleteServicePartner(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<any>(this.api.buildEndpoint(API_ROUTES.SERVICE_PARTNER.DELETE, id));
  }
  downloadAttachment(servicePartnerId: number, attachmentId: number): Observable<Blob> {
    const endpoint = API_ROUTES.SERVICE_PARTNER.DOWNLOAD_ATTACHMENT
      .replace(':id', String(servicePartnerId))
      .replace(':attachmentId', String(attachmentId));
    return this.http.get(`${this.api.baseUrl}${endpoint}`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }
}