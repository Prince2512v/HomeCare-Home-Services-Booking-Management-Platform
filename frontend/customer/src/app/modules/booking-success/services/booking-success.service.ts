import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import { environment } from 'src/environments/environment';
import { BookingSuccessData } from '../models/booking-success.models';

@Injectable({ providedIn: 'root' })
export class BookingSuccessService {
  constructor(private api: ApiService) {}

  getBookingDetails(
    bookingId: number,
  ): Observable<ApiResponse<BookingSuccessData>> {
    return this.api.get<BookingSuccessData>(
      `${API_ROUTES.BOOKING.BASE}/${bookingId}`,
    );
  }

  downloadInvoice(bookingId: number): Observable<Blob> {
    return this.api.getBlob(`${API_ROUTES.BOOKING.BASE}/${bookingId}/invoice`);
  }
  getPartnerAvatarUrl(imageFile?: string): string {
    if (!imageFile) return 'assets/images/avtar.jpg';
    if (imageFile.startsWith('http')) return imageFile;
    return `${environment.apiUrl}${API_ROUTES.SERVICE_PARTNER.PROFILE_IMAGE}/${imageFile}`;
  }
}