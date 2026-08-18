export const API_ROUTES = {
  HOME: {
    SERVICE_NAMES: '/api/home/services-names',
    SERVICE_TYPES: '/api/home/service-types',
    POPULAR: '/api/home/popular-services',
    ALL_SERVICES: '/api/home/all-services',
    COUNTS: '/api/home/dashboard-counts',
  },
  SERVICE: {
    SERVICE_TYPES_WITH_BOOKING_COUNT: '/api/service-type/with-booking-count',
  },

  BOOKING: {
    BASE: '/api/booking',
    SLOT_AVAILABILITY: '/api/booking/slot-availability',
    CREATE: '/api/booking',
    MY_BOOKINGS: '/api/booking/my-bookings',
  },

  OTP: {
    SEND: '/api/otp/send',
    VERIFY: '/api/otp/verify',
    REFRESH: '/api/otp/refresh',
    LOGOUT: '/api/otp/logout',
  },

  USERS: {
    PROFILE: '/api/users/profile',
    PROFILE_PHONE: '/api/users/profile/phone',
    PROFILE_EMAIL: '/api/users/profile/email',
    PROFILE_EMAIL_SEND_OTP: '/api/users/profile/email/send-otp',
  },

  ADDRESS: {
    BASE: '/api/address',
    REVERSE_GEOCODE: '/api/address/reverse-geocode',
    SEARCH: '/api/address/search',
  },

  SERVICE_PARTNER: {
    SERVICE_TYPES: '/api/ServiceType/get',
    CATEGORIES: '/api/categories/get',
    SUB_CATEGORIES: '/api/subcategories/get',
    LANGUAGES: '/api/language',
    UPLOAD_PROFILE_IMAGE: '/api/service-partner/upload-profile-image',
    PROFILE_IMAGE: '/api/service-partner/profile-image',
    UPLOAD_ATTACHMENT: '/api/service-partner/upload-attachment',
    APPLY: '/api/service-partner/apply',
  },

  SERVICE_LISTING: {
    SERVICE_TYPE: '/api/service-list/service-type',
    SUBCATEGORY: '/api/service-list/subcategory',
    SERVICES: '/api/service-list/services',
  },
  SERVICES: {
    DETAIL: (id: number) => `/api/services/detail/${id}`,
  },
  SUPPORT_TICKETS: {
    SUBMIT: '/api/support-tickets/submit',
  },
  OFFER: {
    BASE: '/api/offer',
    CHECKOUT_SUMMARY: '/api/offer/checkout-summary',
    VALIDATE: '/api/offer/validate',
  },
  PAYMENT: {
    CREATE_INTENT: '/api/payment/create-intent',
    CONFIRM: '/api/payment/confirm',
    FAILED: '/api/payment/failed',
  },
};