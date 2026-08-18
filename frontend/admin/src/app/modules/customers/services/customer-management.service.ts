import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import {
  FilterCustomerRequestModel,
  CreateCustomerRequestModel,
  GetCustomerResponseModel,
  CustomerQueryResponseModel,
  CustomerDetailResponse,
  CustomerBookingsResponseModel,
  FilterCustomerBookingsRequestModel,
} from '@customerManagementModels';

@Injectable({ providedIn: 'root' })
export class CustomerManagementService {
  private api = inject(ApiService);

  getAllCustomers(
    filter: FilterCustomerRequestModel
  ): Observable<ApiResponse<CustomerQueryResponseModel>> {
    const params: Record<string, string> = {
      pageNumber: String(filter.pageNumber),
      pageSize: String(filter.pageSize),
    };

    if (filter.status !== null && filter.status !== undefined)
      params['status'] = String(filter.status);
    if (filter.bookingMin !== null && filter.bookingMin !== undefined)
      params['bookingMin'] = String(filter.bookingMin);
    if (filter.bookingMax !== null && filter.bookingMax !== undefined)
      params['bookingMax'] = String(filter.bookingMax);

    if (filter.sortField) params['sortField'] = filter.sortField;
    if (filter.sortDirection) params['sortDirection'] = filter.sortDirection;

    return this.api.get<CustomerQueryResponseModel>(API_ROUTES.CUSTOMER.LIST, params);
  }

  getCustomerDetail(id: number): Observable<ApiResponse<CustomerDetailResponse>> {
    return this.api.get<CustomerDetailResponse>(
      this.api.buildEndpoint(API_ROUTES.CUSTOMER.DETAIL, id)
    );
  }

  getCustomerBookings(
    id: number,
    filter: FilterCustomerBookingsRequestModel
  ): Observable<ApiResponse<CustomerBookingsResponseModel>> {
    const params: Record<string, string> = {
      pageNumber: String(filter.pageNumber),
      pageSize: String(filter.pageSize),
    };

    if (filter.sortField) params['sortField'] = filter.sortField;
    if (filter.sortDirection) params['sortDirection'] = filter.sortDirection;
    if (filter.serviceTypeId != null) params['serviceTypeId'] = String(filter.serviceTypeId);
    if (filter.date) params['date'] = filter.date;
    if (filter.time) params['time'] = filter.time;
    if (
      filter.amountMin !== null &&
      filter.amountMin !== undefined &&
      isFinite(Number(filter.amountMin))
    )
      params['amountMin'] = String(filter.amountMin);
    if (
      filter.amountMax !== null &&
      filter.amountMax !== undefined &&
      isFinite(Number(filter.amountMax))
    )
      params['amountMax'] = String(filter.amountMax);
    if (filter.paymentMethod) params['paymentMethod'] = filter.paymentMethod;
    if (filter.status) params['status'] = filter.status;

    return this.api.get<CustomerBookingsResponseModel>(
      this.api.buildEndpoint(API_ROUTES.CUSTOMER.BOOKINGS, id),
      params
    );
  }

  createCustomer(
    request: CreateCustomerRequestModel
  ): Observable<ApiResponse<GetCustomerResponseModel>> {
    return this.api.post<GetCustomerResponseModel>(API_ROUTES.CUSTOMER.CREATE, request);
  }

  updateStatus(id: number): Observable<ApiResponse<boolean>> {
    return this.api.patch<boolean>(this.api.buildEndpoint(API_ROUTES.CUSTOMER.UPDATE_STATUS, id));
  }

  deleteCustomer(id: number): Observable<ApiResponse<boolean>> {
    return this.api.delete<boolean>(this.api.buildEndpoint(API_ROUTES.CUSTOMER.DELETE, id));
  }
}