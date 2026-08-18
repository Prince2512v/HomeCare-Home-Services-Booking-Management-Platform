import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import {
  CheckoutSummary,
  ActiveOffer,
  ValidateCouponRequest,
  CreateTransactionIntentRequest,
  TransactionIntentResponse,
  ConfirmTransactionRequest,
  BookingResponseModel,
  FailedTransactionRequest,
  CashBookingRequest,
} from '../Models/checkout.models';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(private api: ApiService) {}

  getActiveOffers(): Observable<ApiResponse<ActiveOffer[]>> {
    return this.api.get<ActiveOffer[]>(API_ROUTES.OFFER.BASE);
  }

  getCheckoutSummary(
    serviceId: number,
  ): Observable<ApiResponse<CheckoutSummary>> {
    return this.api.get<CheckoutSummary>(
      `${API_ROUTES.OFFER.CHECKOUT_SUMMARY}/${serviceId}`,
    );
  }

  validateCoupon(
    request: ValidateCouponRequest,
  ): Observable<ApiResponse<CheckoutSummary>> {
    return this.api.post<CheckoutSummary>(API_ROUTES.OFFER.VALIDATE, request);
  }

  createIntent(
    request: CreateTransactionIntentRequest,
  ): Observable<ApiResponse<TransactionIntentResponse>> {
    return this.api.post<TransactionIntentResponse>(
      API_ROUTES.PAYMENT.CREATE_INTENT,
      request,
    );
  }

  confirmPayment(
    request: ConfirmTransactionRequest,
  ): Observable<ApiResponse<BookingResponseModel>> {
    return this.api.post<BookingResponseModel>(
      API_ROUTES.PAYMENT.CONFIRM,
      {
        razorpayOrderId:   request.razorpayOrderId,
        razorpayPaymentId: request.razorpayPaymentId,
        razorpaySignature: request.razorpaySignature,
      },
    );
  }

  recordFailedTransaction(
    request: FailedTransactionRequest,
  ): Observable<ApiResponse<void>> {
    return this.api.post<void>(API_ROUTES.PAYMENT.FAILED, request);
  }

  createCashBooking(
    request: CashBookingRequest,
  ): Observable<ApiResponse<BookingResponseModel>> {
    return this.api.post<BookingResponseModel>(API_ROUTES.BOOKING.CREATE, {
      ...request,
      paymentMethod: 2, // PaymentMethod.Cash enum
    });
  }
}