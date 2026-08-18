import { Routes } from '@angular/router';
import { ROUTES } from '@constants';

export const SERVICE_LISTING_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: ROUTES.CUSTOMER.SERVICE_LISTING.SERVICE_LISTING,
        loadComponent: () =>
          import('./components/servicelisting/servicelisting.js').then((m) => m.ServiceListing),
      },
    ],
  },
];