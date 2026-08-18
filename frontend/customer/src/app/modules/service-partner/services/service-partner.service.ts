import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import { environment } from 'src/environments/environment';
import {
  ApplyServicePartnerRequest,
  ApplyServicePartnerResponse,
  Category,
  Language,
  PaginatedRecords,
  ServiceType,
  SubCategory,
  UploadAttachmentResponse,
  UploadProfileImageResponse,
} from '../models/service-partner.models';

@Injectable({ providedIn: 'root' })
export class ServicePartnerService {
  private apiService = inject(ApiService);

  getServiceTypes(): Observable<ApiResponse<PaginatedRecords<ServiceType>>> {
    return this.apiService.get<PaginatedRecords<ServiceType>>(
      API_ROUTES.SERVICE_PARTNER.SERVICE_TYPES,
      null,
      true,
    );
  }

  getCategoriesByServiceType(
    serviceTypeId: number,
  ): Observable<ApiResponse<PaginatedRecords<Category>>> {
    return this.apiService.get<PaginatedRecords<Category>>(
      API_ROUTES.SERVICE_PARTNER.CATEGORIES,
      { serviceTypeId: serviceTypeId.toString() },
      true,
    );
  }

  getSubCategoriesByCategory(
    categoryId: number,
  ): Observable<ApiResponse<PaginatedRecords<SubCategory>>> {
    return this.apiService.get<PaginatedRecords<SubCategory>>(
      API_ROUTES.SERVICE_PARTNER.SUB_CATEGORIES,
      { categoryId: categoryId.toString() },
      true,
    );
  }

  getLanguages(): Observable<ApiResponse<Language[]>> {
    return this.apiService.get<Language[]>(
      API_ROUTES.SERVICE_PARTNER.LANGUAGES,
    );
  }

  uploadProfileImage(
    file: File,
  ): Observable<ApiResponse<UploadProfileImageResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.postFormData<UploadProfileImageResponse>(
      API_ROUTES.SERVICE_PARTNER.UPLOAD_PROFILE_IMAGE,
      formData,
    );
  }

  getProfileImageUrl(imageName: string): string {
    return `${environment.apiUrl}${API_ROUTES.SERVICE_PARTNER.PROFILE_IMAGE}/${imageName}`;
  }

  uploadAttachment(
    file: File,
    documentLabel?: string,
  ): Observable<ApiResponse<UploadAttachmentResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (documentLabel) formData.append('documentLabel', documentLabel);
    return this.apiService.postFormData<UploadAttachmentResponse>(
      API_ROUTES.SERVICE_PARTNER.UPLOAD_ATTACHMENT,
      formData,
    );
  }

  apply(
    payload: ApplyServicePartnerRequest,
  ): Observable<ApiResponse<ApplyServicePartnerResponse>> {
    return this.apiService.post<ApplyServicePartnerResponse>(
      API_ROUTES.SERVICE_PARTNER.APPLY,
      payload,
    );
  }
}
