import { Routes } from '@angular/router';

export const OFFER_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/offer-page/offer-page').then((m) => m.OfferPage),
  }
];
