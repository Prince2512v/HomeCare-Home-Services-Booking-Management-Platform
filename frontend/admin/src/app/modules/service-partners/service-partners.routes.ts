import { Routes } from '@angular/router';

export const SERVICEPATNERS_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/service-partners.js').then((m) => m.ServicePartners),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/service-partner-details/service-partner-details.js').then(
        (m) => m.ServicePartnerDetail
      ),
  },
];
