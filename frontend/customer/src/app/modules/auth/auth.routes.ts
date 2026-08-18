import { Routes } from '@angular/router';
import { ROUTES } from '@constants';

export const CUSTOMER_AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: ROUTES.CUSTOMER.SIGN_IN.SIGN_IN,
        loadComponent: () =>
          import('./components/customer/sign-in/sign-in').then((m) => m.CustomerSignIn),
      },
      {
        path: ROUTES.CUSTOMER.OTP_VERIFY.OTP_VERIFY,
        loadComponent: () =>
          import('./components/customer/otp-verify/otp-verify').then((m) => m.OtpVerify),
      },
    ],
  },
];