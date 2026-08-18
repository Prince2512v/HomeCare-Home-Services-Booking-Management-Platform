export const ROUTES = {
  CUSTOMER: {
    SIGN_IN: {
      SIGN_IN: 'sign-in',
      SIGN_IN_ABSOLUTE: '/customer/sign-in',
    },
    OTP_VERIFY: {
      OTP_VERIFY: 'otp-verify',
      OTP_VERIFY_ABSOLUTE: '/customer/otp-verify',
    },
    HOME: {
      HOME: '',
      HOME_ABSOLUTE: '/',
    },
    SERVICES: {
      SERVICES: 'services',
      SERVICES_ABSOLUTE: '/services',
    },
    SERVICE_DETAIL: {
      SERVICE_DETAIL: 'services/detail/:id',
      SERVICE_DETAIL_ABSOLUTE: (id: number) => `/services/detail/${id}`,
    },
    PROFILE: {
      PROFILE: 'profile',
      PROFILE_ABSOLUTE: '/customer/profile',
    },
    CONTACT: {
      CONTACT: 'contact',
      CONTACT_ABSOLUTE: '/contact',
    },
    SERVICE_LISTING: {
      SERVICE_LISTING: 'services/:serviceTypeId',
      SERVICE_LISTING_ABSOLUTE: '/services',
    },
    CHECKOUT: {
      CHECKOUT: 'checkout',
      CHECKOUT_ABSOLUTE: '/customer/checkout',
    },
    BOOKING_SUCCESS: {
      BOOKING_SUCCESS: 'booking-success',
      BOOKING_SUCCESS_ABSOLUTE: '/customer/booking-success',
    },
    MY_BOOKINGS: {
      MY_BOOKINGS: 'my-bookings',
      MY_BOOKINGS_ABSOLUTE: '/customer/my-bookings',
    },
  },
  SERVICE_PARTNER: {
    ONBOARDING: {
      ONBOARDING: 'onboarding',
      ONBOARDING_ABSOLUTE: '/service-partner/onboarding',
    },
    ONBOARDING_SUCCESS: {
      ONBOARDING_SUCCESS: 'onboarding-success',
      ONBOARDING_SUCCESS_ABSOLUTE: '/service-partner/onboarding-success',
    },
  },
};