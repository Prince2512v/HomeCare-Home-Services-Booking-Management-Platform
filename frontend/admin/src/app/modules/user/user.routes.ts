import { Routes } from '@angular/router';
import { ROUTES } from '@constants';

export const USER_ROUTES: Routes = [
  {
    path: ROUTES.USER_MANAGEMENT.ADMIN_USERS.ADMIN_USERS,
    loadComponent: () =>
      import('./components/admin-users/admin-users-page/admin-users-page').then(
        (m) => m.AdminUsersPage
      ),
  },
];