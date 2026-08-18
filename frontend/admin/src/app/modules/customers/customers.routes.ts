import { Routes } from '@angular/router';

export const USER_MANAGEMENT_CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/customer-management/customer-management').then(
        (m) => m.CustomerManagement
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/customer-detail/customer-detail').then((m) => m.CustomerDetail),
  },
];
