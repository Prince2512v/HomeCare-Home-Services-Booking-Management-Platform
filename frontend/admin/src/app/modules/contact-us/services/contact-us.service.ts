  import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { DataQueryResponseModel } from '@offerModels';
import {
  GetContactUsResponseModel,
  FilterContactUsRequestModel
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {

  private apiService = inject(ApiService);

  getContactUs(
    pageNumber: number,
    pageSize: number,
    filter?: FilterContactUsRequestModel,
    sortField?: string,
    sortDirection?: string
  ): Observable<ApiResponse<DataQueryResponseModel<GetContactUsResponseModel>>> {
    const params: Record<string, string> = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    };

    if (filter) {
      if (filter.userName) {
        params['userName'] = filter.userName;
      }
      if (filter.submittedAt) {
        params['submittedAt'] = filter.submittedAt;
      }
    }

    if (sortField) {
      params['sortField'] = sortField;
    }
    if (sortDirection) {
      params['sortDirection'] = sortDirection;
    }

    return this.apiService.get<DataQueryResponseModel<GetContactUsResponseModel>>(
      API_ROUTES.CONTACT_US.LIST,
      params
    );
  }
}