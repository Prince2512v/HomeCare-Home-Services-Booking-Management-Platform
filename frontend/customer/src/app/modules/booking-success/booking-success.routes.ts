import { Routes } from '@angular/router';

export const BOOKING_SUCCESS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/booking-success/booking-success.js').then(
        (m) => m.BookingSuccess,
      ),
  },
];