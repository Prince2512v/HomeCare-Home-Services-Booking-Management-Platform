import { Routes } from '@angular/router';
import { ROUTES } from '@constants';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: ROUTES.AUTH.LOGIN.LOGIN,
        loadComponent: () =>
          import('./components/admin/admin-login/admin-login').then((m) => m.AdminLogin),
      },
      {
        path: ROUTES.AUTH.FORGOT_PASSWORD.FORGOT_PASSWORD,
        loadComponent: () =>
          import('./components/admin/forgot-password/forgot-password').then(
            (m) => m.ForgotPassword
          ),
      },
      {
        path: ROUTES.AUTH.RESET_PASSWORD.RESET_PASSWORD,
        loadComponent: () =>
          import('./components/admin/reset-password/reset-password').then((m) => m.ResetPassword),
      },
    ],
  },
];
