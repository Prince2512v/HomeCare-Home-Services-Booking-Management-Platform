import { BookingStatus, PaymentStatus } from '@enums';

export { BookingTab } from '@enums';

export interface MyBookingAddress {
  addressId: number;
  houseFlatNumber: string;
  landmark: string | null;
  fullAddress: string | null;
  saveAs: string | null;
}

export interface MyBookingPartner {
  id: number;
  fullName: string;
  profileImageUrl: string | null;
  role: string;
  mobileNumber: string;
}

export interface MyBooking {
  id: number;
  serviceId: number;
  serviceName: string;
  durationInMinutes: number;
  serviceTypeId: number;
  serviceTypeName: string;
  bookingDate: string;
  bookingTime: string;
  bookingAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  address: MyBookingAddress | null;
  assignedPartner: MyBookingPartner | null;
}

export const BookingStatusLabel: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: 'Pending',
  [BookingStatus.Confirmed]: 'Confirmed',
  [BookingStatus.Completed]: 'Completed',
  [BookingStatus.Cancelled]: 'Cancelled',
};

export const BookingStatusClass: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: 'status-pending',
  [BookingStatus.Confirmed]: 'status-confirmed',
  [BookingStatus.Completed]: 'status-completed',
  [BookingStatus.Cancelled]: 'status-cancelled',
};
