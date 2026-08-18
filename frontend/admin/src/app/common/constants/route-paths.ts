export const ROUTES = {
  AUTH: {
    LOGIN: {
      LOGIN: 'login',

      LOGIN_ABSOLUTE: '/auth/login',
    },

    FORGOT_PASSWORD: {
      FORGOT_PASSWORD: 'forgot-password',

      FORGOT_PASSWORD_ABSOLUTE: '/auth/forgot-password',
    },

    RESET_PASSWORD: {
      RESET_PASSWORD: 'reset-password',

      RESET_PASSWORD_ABSOLUTE: '/auth/reset-password',
    },
  },

  HOME: {
    HOME: 'home',

    HOME_ABSOLUTE: '/home',
  },

  PROFILE: {
    PROFILE: 'profile',

    PROFILE_ABSOLUTE: '/profile',
  },

  SERVICE_MANAGEMENT: {
    SERVICE_MANAGEMENT: 'service-management',

    SERVICE_MANAGEMENT_ABSOLUTE: '/service-management',

    SERVICE_DETAIL: 'service/:id',

    SERVICE_DETAIL_ABSOLUTE: '/service-management/service',
  },

  USER_MANAGEMENT: {
    USER_MANAGEMENT: 'user-management',

    USER_MANAGEMENT_ABSOLUTE: '/user-management',

    CUSTOMERS: {
      CUSTOMERS: 'customers',

      CUSTOMERS_ABSOLUTE: '/user-management/customers',

      CUSTOMER_DETAIL: 'customers/:id',

      CUSTOMER_DETAIL_ABSOLUTE: '/user-management/customers',
    },

    SERVICE_PARTNERS: {
      SERVICE_PARTNERS: 'service-partners',

      SERVICE_PARTNERS_ABSOLUTE: '/user-management/service-partners',

      SERVICE_PARTNER_DETAIL: 'service-partners/:id',

      SERVICE_PARTNER_DETAIL_ABSOLUTE: '/user-management/service-partners',
    },

    ADMIN_USERS: {
      ADMIN_USERS: 'admin-users',

      ADMIN_USERS_ABSOLUTE: '/user-management/admin-users',
    },
  },

  BOOKING_MANAGEMENT: {
    BOOKING_MANAGEMENT: 'booking-management',

    BOOKING_MANAGEMENT_ABSOLUTE: '/booking-management',
  },

  OFFERS: {
    OFFERS: 'offers',

    OFFERS_ABSOLUTE: '/offers',
  },

  PAYMENT_TRANSACTIONS: {
    PAYMENT_TRANSACTIONS: 'payment-transactions',

    PAYMENT_TRANSACTIONS_ABSOLUTE: '/payment-transactions',

    DETAIL: 'detail/:id',

    DETAIL_ABSOLUTE: '/payment-transactions/detail',
  },

  MASTER_DATA: {
    MASTER_DATA: 'master-data',

    MASTER_DATA_ABSOLUTE: '/master-data',
  },

  SUPPORT: {
    SUPPORT: 'support',

    SUPPORT_ABSOLUTE: '/support',
  },
};