import { Routes } from '@angular/router';

export const BOOKING_MANAGEMENT_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/booking-page/booking-page').then(
        (m) => m.BookingPage
      ),
  },
];