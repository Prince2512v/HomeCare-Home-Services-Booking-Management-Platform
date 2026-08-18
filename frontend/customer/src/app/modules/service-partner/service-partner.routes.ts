import { Routes } from '@angular/router';
import { ROUTES } from '@constants';

export const SERVICE_PARTNER_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: ROUTES.SERVICE_PARTNER.ONBOARDING.ONBOARDING,
        loadComponent: () => import('./components/onboarding/onboarding').then((m) => m.Onboarding),
      },
      {
        path: ROUTES.SERVICE_PARTNER.ONBOARDING_SUCCESS.ONBOARDING_SUCCESS,
        loadComponent: () =>
          import('./components/onboarding-success/onboarding-success').then(
            (m) => m.OnboardingSuccess
          ),
      },
    ],
  },
];
