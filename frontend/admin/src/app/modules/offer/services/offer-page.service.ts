import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import {
  DataQueryResponseModel,
  GetOfferResponseModel,
  CreateOfferRequestModel,
  UpdateOfferRequestModel,
  FilterOfferRequestModel
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private apiService = inject(ApiService);

  getOffers(
    pageNumber: number,
    pageSize: number,
    filter?: FilterOfferRequestModel
  ): Observable<ApiResponse<DataQueryResponseModel<GetOfferResponseModel>>> {
    const params: Record<string, string> = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    };

    if (filter) {
      if (filter.discountPercentage !== null && filter.discountPercentage !== undefined) {
        params['discountPercentage'] = String(filter.discountPercentage);
      }
      if (filter.appliedCountMin !== null && filter.appliedCountMin !== undefined) {
        params['appliedCountMin'] = String(filter.appliedCountMin);
      }
      if (filter.appliedCountMax !== null && filter.appliedCountMax !== undefined) {
        params['appliedCountMax'] = String(filter.appliedCountMax);
      }
      if (filter.availability !== null && filter.availability !== undefined) {
        params['availability'] = String(filter.availability);
      }
      if (filter.sortField) {
        params['sortField'] = filter.sortField;
      }
      if (filter.sortDirection) {
        params['sortDirection'] = filter.sortDirection;
      }
    }

    return this.apiService.get<DataQueryResponseModel<GetOfferResponseModel>>(
      API_ROUTES.OFFER.LIST,
      params
    );
  }

  getOfferById(id: number): Observable<ApiResponse<GetOfferResponseModel>> {
    return this.apiService.get<GetOfferResponseModel>(
      this.apiService.buildEndpoint(API_ROUTES.OFFER.GET_BY_ID, id)
    );
  }

  createOffer(request: CreateOfferRequestModel): Observable<ApiResponse<GetOfferResponseModel>> {
    return this.apiService.post<GetOfferResponseModel>(API_ROUTES.OFFER.CREATE, request);
  }

  updateOffer(
    id: number,
    request: UpdateOfferRequestModel
  ): Observable<ApiResponse<GetOfferResponseModel>> {
    return this.apiService.put<GetOfferResponseModel>(
      this.apiService.buildEndpoint(API_ROUTES.OFFER.UPDATE, id),
      request
    );
  }

  deleteOffer(id: number): Observable<ApiResponse<boolean>> {
    return this.apiService.delete<boolean>(
      this.apiService.buildEndpoint(API_ROUTES.OFFER.DELETE, id)
    );
  }
}