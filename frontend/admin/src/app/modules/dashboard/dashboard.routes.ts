import { Routes } from '@angular/router';
import { ROUTES } from '@constants';
import { LayoutAdmin } from '../../common/components/layout-admin/layout-admin';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: LayoutAdmin,
    children: [
      {
        path: ROUTES.HOME.HOME,
        loadComponent: () =>
          import('./components/dashboard-home/dashboard-home').then((m) => m.DashboardHome),
      },
      {
        path: ROUTES.PROFILE.PROFILE,
        loadComponent: () =>
          import('./components/admin-profile/admin-profile').then((m) => m.AdminProfile),
      },

      // SERVICE MANAGEMENT
      {
        path: ROUTES.SERVICE_MANAGEMENT.SERVICE_MANAGEMENT,
        loadChildren: () =>
          import('../service-management/service-management.routes').then(
            (m) => m.SERVICE_MANAGEMENT_ROUTES
          ),
      },

      // USER MANAGEMENT
      {
        path: ROUTES.USER_MANAGEMENT.USER_MANAGEMENT,
        children: [
          {
            path: ROUTES.USER_MANAGEMENT.CUSTOMERS.CUSTOMERS,
            loadChildren: () =>
              import('../customers/customers.routes').then(
                (m) => m.USER_MANAGEMENT_CUSTOMER_ROUTES
              ),
          },

          {
            path: ROUTES.USER_MANAGEMENT.SERVICE_PARTNERS.SERVICE_PARTNERS,
            loadChildren: () =>
              import('../service-partners/service-partners.routes').then(
                (m) => m.SERVICEPATNERS_ROUTE
              ),
          },

          {
            path: ROUTES.USER_MANAGEMENT.ADMIN_USERS.ADMIN_USERS,
            loadComponent: () =>
              import('../user/components/admin-users/admin-users-page/admin-users-page').then(
                (m) => m.AdminUsersPage
              ),
          },
        ],
      },

      // BOOKING MANAGEMENT
      {
        path: ROUTES.BOOKING_MANAGEMENT.BOOKING_MANAGEMENT,
        loadChildren: () =>
          import('../booking-management/booking-management.routes').then(
            (m) => m.BOOKING_MANAGEMENT_ROUTE
          ),
      },

      // OFFERS
      {
        path: ROUTES.OFFERS.OFFERS,
        loadChildren: () => import('../offer/offer-page.routes.js').then((m) => m.OFFER_ROUTE),
      },

      // PAYMENT & TRANSACTIONS
      {
        path: ROUTES.PAYMENT_TRANSACTIONS.PAYMENT_TRANSACTIONS,
        loadChildren: () =>
          import('../payment-transaction/payment-transactions.routes.js').then(
            (m) => m.PAYMENT_TRANSACTIONS_ROUTES
          ),
      },

      // MASTER DATA
      {
        path: ROUTES.MASTER_DATA.MASTER_DATA,
        loadChildren: () =>
          import('../master-data/master-data.routes').then((m) => m.MASTER_DATA_ROUTES),
      },

      // SUPPORT
      {
        path: ROUTES.SUPPORT.SUPPORT,
        loadChildren: () =>
          import('../contact-us/contact-us.routes').then((m) => m.CONTACT_US_ROUTES),
      },
    ],
  },
];
