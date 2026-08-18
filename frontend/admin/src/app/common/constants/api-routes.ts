export const API_ROUTES = {
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VALIDATE_RESET_TOKEN: '/auth/validate-reset-token',
    LOGOUT: '/auth/logout',
  },

  ADMIN: {
    PROFILE: {
      BASE: '/admin/profile',
      CONTACT: '/admin/profile/contact',
      PASSWORD: '/admin/profile/password',
      IMAGE: '/admin/profile/image',
    },
  },

  DASHBOARD: {
    CARD_TOTAL_SERVICES_BOOKED: '/dashboard/cards/total-services-booked',
    CARD_ACTIVE_USERS: '/dashboard/cards/active-users',
    CARD_ACTIVE_SERVICE_PARTNERS: '/dashboard/cards/active-service-partners',
    CARD_TOTAL_REVENUE: '/dashboard/cards/total-revenue',
    TOP_PERFORMING_SERVICES: '/dashboard/top-performing-services',
    REVENUE_OVERVIEW: '/dashboard/revenue-overview',
    CITY_BOOKINGS_CHART: '/dashboard/city-bookings-chart',
    TOP_SERVICE_PARTNERS: '/dashboard/top-service-partners',
  },

  ADMIN_USER: {
    LIST: '/AdminUser/list',
    BY_ID: '/AdminUser/:id',
    CREATE: '/AdminUser',
    UPDATE: '/AdminUser/:id',
    DELETE: '/AdminUser/:id',
    CHANGE_PASSWORD: '/AdminUser/change-password',
  },

  SERVICE_TYPE: {
    BASE: '/ServiceType',
    GET_ALL: '/ServiceType/get',
    GET_BY_ID: '/ServiceType/get/:id',
    ADD: '/ServiceType/add',
    UPDATE: '/ServiceType/update/:id',
    DELETE: '/ServiceType/delete/:id',
    IMAGE: '/ServiceType/:id/image',
  },

  CATEGORY: {
    BASE: '/categories',
    GET: '/categories/get',
    ADD: '/categories/add',
    DELETE: '/categories/delete/:id',
  },

  SUB_CATEGORY: {
    BASE: '/subcategories',
    GET: '/subcategories/get',
    ADD: '/subcategories/add',
    DELETE: '/subcategories/delete/:id',
  },
  SERVICES: {
    GET_ALL: '/services/get',
    GET_BY_ID: '/services/get/:id',
    ADD: '/services/add',
    UPDATE: '/services/update/:id',
    DELETE: '/services/delete/:id',
    AVAILABILITY: '/Services/:id/availability',
    BY_SERVICE_TYPE: '/services/by-service-type/:id',
  },
  CUSTOMER: {
    BASE: '/Customer',
    LIST: '/Customer/list',
    DETAIL: '/Customer/:id',
    BOOKINGS: '/Customer/:id/bookings',
    CREATE: '/Customer',
    DELETE: '/Customer/:id',
    UPDATE_STATUS: '/Customer/:id/status',
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    LIST: '/transactions/list',
    GET_BY_ID: '/transactions/:id',
    DELETE: '/transactions/:id',
    BY_USER: '/transactions/user/:id',
  },

  OFFER: {
    BASE: '/Offer',
    LIST: '/Offer/list',
    GET_BY_ID: '/Offer/:id',
    CREATE: '/Offer',
    UPDATE: '/Offer/:id',
    DELETE: '/Offer/:id',
  },

  CONTACT_US: {
    BASE: '/support-tickets',
    LIST: '/support-tickets/list',
  },

  SERVICE_PARTNER: {
    BASE: '/service-partners',
    LIST: '/service-partners/list',
    GET_BY_ID: '/service-partners/:id',
    APPROVE: '/service-partners/:id/approve',
    REJECT: '/service-partners/:id/reject',
    ASSIGNED_SERVICES: '/service-partners/:id/assigned-services',
    TOGGLE_STATUS: '/service-partners/:id/toggle-status',
    DELETE: '/service-partners/:id/delete',
    UPLOAD_ATTACHMENT: '/service-partners/upload-attachment',
    DOWNLOAD_ATTACHMENT: '/service-partners/:id/attachments/:attachmentId/download',
  },

  BOOKING: {
    LIST: '/booking/list',
    DETAILS_BY_USER: '/booking/:userId/details',
    AVAILABLE_EXPERTS: '/booking/available-experts',
    CHANGE_EXPERT: '/booking/change-expert',
    COMPLETE: '/booking/:bookingId/complete',
    CANCEL: '/booking/cancel',
    DELETE_BOOKINGS_BY_PAYMENT: '/booking/customer/:userId/payment/:paymentMethod',
    DELETE_BOOKING: '/booking/:bookingId',
  },
};