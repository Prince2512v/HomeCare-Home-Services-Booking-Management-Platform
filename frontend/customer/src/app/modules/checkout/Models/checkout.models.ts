export interface BookingRequest {
  bookingDate: string;
  bookingTime: string;
}

export const CheckoutResx = {
  BookingDateRequired: 'Booking date is required.',
  BookingTimeRequired: 'Booking time is required.',
};

export interface SlotAvailabilityRequest {
  ServiceId: number;
  ServiceTypeId: number;
  BookingDate: string;
  BookingTime: string;
}

export interface SlotAvailabilityResponse {
  isAvailable: boolean;
  message: string;
  partner: { id: number; name: string } | null;
}

export interface SlotSelection {
  bookingDate: string;
  bookingTime: string;
}

export interface ActiveOffer {
  id: number;
  couponCode: string;
  couponDescription: string;
  discountPercentage: number;
  appliedCount: number;
  maxUsage: number;
  expiresAt: string;
}

export interface CheckoutSummary {
  serviceId: number;
  serviceName: string;
  itemsTotal: number;
  taxPercentage: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  appliedOfferId: number | null;
  appliedCouponCode: string | null;
}

export interface ValidateCouponRequest {
  serviceId: number;
  offerId: number;
}

export interface CreateIntentPayload {
  serviceId: number;
  serviceTypeId: number;
  addressId: number;
  bookingDate: string;
  bookingTime: string;
  offerId?: number | null;
}

export interface IntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface CreateTransactionIntentRequest {
  serviceId: number;
  serviceTypeId: number;
  addressId: number;
  bookingDate: string; // 'YYYY-MM-DD'
  bookingTime: string;
  offerId?: number | null;
}

export interface TransactionIntentResponse {
  razorpayOrderId: string;  // replaces clientSecret/paymentIntentId
  keyId: string;            // Razorpay Key ID to open checkout popup
  amount: number;
  currency: string;
}

export interface ConfirmTransactionRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface FailedTransactionRequest {
  paymentIntentId: string; // stores razorpay order_id
}

export interface BookingResponseModel {
  id: number;
  bookingDate: string;
  bookingTime: string;
  status: string;
  paymentStatus: string;
  bookingAmount: number;
  paymentMethod: string;
  durationMinutes: number;
  assignedPartner?: AssignedPartner;
}
export interface AssignedPartner {
  id: number;
  fullName: string;
  profileImageUrl: string | null;
  totalJobsCompleted: number;
}

export interface CashBookingRequest {
  serviceId: number;
  serviceTypeId: number;
  addressId: number;
  bookingDate: string;
  bookingTime: string;
  offerId?: number | null;
}

export type PaymentMethodType = 'Debit/Credit Card' | 'Cash';