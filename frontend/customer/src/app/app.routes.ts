import { Routes } from '@angular/router';
import { ROUTES } from '@constants';
import { AuthGuard } from '@guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./common/components/customer-layout/customer-layout').then(
        (m) => m.CustomerLayout,
      ),
    children: [
      {
        path: ROUTES.CUSTOMER.HOME.HOME,
        loadComponent: () =>
          import('./modules/homepage/components/home/home').then((m) => m.Home),
      },
      {
        path: ROUTES.CUSTOMER.SERVICES.SERVICES,
        loadComponent: () =>
          import('./modules/services/components/service-section/service-section').then(
            (m) => m.ServiceSection,
          ),
      },
      {
        path: ROUTES.CUSTOMER.CONTACT.CONTACT,
        loadComponent: () =>
          import('./modules/contact-us/components/contact-us/contact-us').then(
            (m) => m.ContactUs,
          ),
      },
      {
        path: ROUTES.CUSTOMER.SERVICE_LISTING.SERVICE_LISTING,
        loadComponent: () =>
          import('./modules/service-listing/components/servicelisting/servicelisting').then(
            (m) => m.ServiceListing,
          ),
      },
      {
        path: ROUTES.CUSTOMER.SERVICE_DETAIL.SERVICE_DETAIL,
        loadComponent: () =>
          import('./modules/service-detail/components/service-detail/service-detail.js').then(
            (m) => m.ServiceDetail,
          ),
      },
      {
        path: ROUTES.CUSTOMER.SERVICE_LISTING.SERVICE_LISTING,
        loadComponent: () =>
          import('./modules/service-listing/components/servicelisting/servicelisting').then(
            (m) => m.ServiceListing,
          ),
      },
    ],
  },
  {
    path: 'customer',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.CUSTOMER_AUTH_ROUTES),
  },
  {
    path: 'customer',
    loadComponent: () =>
      import('./common/components/customer-layout/customer-layout').then(
        (m) => m.CustomerLayout,
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: ROUTES.CUSTOMER.PROFILE.PROFILE,
        loadComponent: () =>
          import('./modules/profile/profile').then((m) => m.Profile),
      },
      {
        path: ROUTES.CUSTOMER.MY_BOOKINGS.MY_BOOKINGS,
        loadComponent: () =>
          import('./modules/my-bookings/my-bookings').then((m) => m.MyBookings),
      },
    ],
  },
  {
    path: 'service-partner',
    loadChildren: () =>
      import('./modules/service-partner/service-partner.routes').then(
        (m) => m.SERVICE_PARTNER_ROUTES,
      ),
  },
  {
    path: 'customer',
    loadComponent: () =>
      import('./common/components/checkout-layout/checkout-layout').then(
        (m) => m.CheckoutLayout,
      ),
    children: [
      {
        path: ROUTES.CUSTOMER.CHECKOUT.CHECKOUT,
        loadChildren: () =>
          import('./modules/checkout/checkout.routes').then(
            (m) => m.CHECKOUT_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'customer',
    loadComponent: () =>
      import('./common/components/checkout-layout/checkout-layout').then(
        (m) => m.CheckoutLayout,
      ),
    children: [
      {
        path: ROUTES.CUSTOMER.BOOKING_SUCCESS.BOOKING_SUCCESS,
        loadChildren: () =>
          import('./modules/booking-success/booking-success.routes').then(
            (m) => m.BOOKING_SUCCESS_ROUTES,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];