import { Routes } from '@angular/router';

export const MASTER_DATA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/master-data/master-data').then((m) => m.MasterData),
  }
];
