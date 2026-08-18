import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import {
  FilteredDataQueryResponseModel,
  CustomerBookingSummaryResponse,
  BookingDetailResponse,
  AvailableExpertResponse,
  ChangeExpertRequestModel,
  CancelBookingRequestModel,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiService = inject(ApiService);

  getCustomerBookingSummaries(
    params: Record<string, string>
  ): Observable<ApiResponse<FilteredDataQueryResponseModel<CustomerBookingSummaryResponse>>> {
    return this.apiService.get<FilteredDataQueryResponseModel<CustomerBookingSummaryResponse>>(
      API_ROUTES.BOOKING.LIST,
      params
    );
  }

  getBookingDetailsByUserId(
    userId: number,
    params: Record<string, string>
  ): Observable<ApiResponse<BookingDetailResponse[]>> {
    return this.apiService.get<BookingDetailResponse[]>(
      API_ROUTES.BOOKING.DETAILS_BY_USER.replace(':userId', String(userId)),
      params
    );
  }

  getAvailableExperts(
    serviceTypeId: number,
    excludeBookingId?: number
  ): Observable<ApiResponse<AvailableExpertResponse[]>> {
    const params: Record<string, string> = {
      serviceTypeId: String(serviceTypeId),
    };
    if (excludeBookingId !== null) {
      params['excludeBookingId'] = String(excludeBookingId);
    }
    return this.apiService.get<AvailableExpertResponse[]>(
      API_ROUTES.BOOKING.AVAILABLE_EXPERTS,
      params
    );
  }

  changeExpert(request: ChangeExpertRequestModel): Observable<ApiResponse<boolean>> {
    return this.apiService.put<boolean>(API_ROUTES.BOOKING.CHANGE_EXPERT, request);
  }

  completeBooking(bookingId: number): Observable<ApiResponse<boolean>> {
    return this.apiService.put<boolean>(
      API_ROUTES.BOOKING.COMPLETE.replace(':bookingId', String(bookingId))
    );
  }

  cancelBooking(request: CancelBookingRequestModel): Observable<ApiResponse<boolean>> {
    return this.apiService.put<boolean>(API_ROUTES.BOOKING.CANCEL, request);
  }

  deleteBookingsByPayment(userId: number, paymentMethod: string): Observable<ApiResponse<boolean>> {
    return this.apiService.delete<boolean>(
      API_ROUTES.BOOKING.DELETE_BOOKINGS_BY_PAYMENT.replace(':userId', String(userId)).replace(
        ':paymentMethod',
        paymentMethod
      )
    );
  }

  deleteBooking(bookingId: number): Observable<ApiResponse<boolean>> {
    return this.apiService.delete<boolean>(
      API_ROUTES.BOOKING.DELETE_BOOKING.replace(':bookingId', String(bookingId))
    );
  }
}