import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import { MyBooking, BookingTab } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(ApiService);

  getMyBookings(tab: BookingTab): Observable<ApiResponse<MyBooking[]>> {
    return this.api.get<MyBooking[]>(API_ROUTES.BOOKING.MY_BOOKINGS, {
      Tab: String(tab),
    });
  }

  downloadInvoice(bookingId: number): Observable<Blob> {
    return this.api.getBlob(`${API_ROUTES.BOOKING.BASE}/${bookingId}/invoice`);
  }
}