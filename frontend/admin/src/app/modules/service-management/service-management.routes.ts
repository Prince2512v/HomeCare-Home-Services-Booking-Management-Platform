import { Routes } from '@angular/router';

export const SERVICE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/service-management/service-management').then((m) => m.ServiceManagement),
  },
  {
    path: 'service/:id',
    loadComponent: () =>
      import('./components/service-details/service-details.js').then((m) => m.ServiceDetail),
  },
];