import { Injectable } from '@angular/core';
import { BookingSuccessData } from '../../modules/booking-success/models/booking-success.models.js';

@Injectable({ providedIn: 'root' })
export class BookingSuccessStateService {
  private bookingData: BookingSuccessData | null = null;

  setBookingData(data: BookingSuccessData): void {
    this.bookingData = data;
  }

  getBookingData(): BookingSuccessData | null {
    return this.bookingData;
  }

  clearBookingData(): void {
    this.bookingData = null;
  }
}