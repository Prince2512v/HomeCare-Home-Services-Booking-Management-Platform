export interface CustomerBookingSummaryResponse {
  userId: number;
  customerName: string;
  mobileNumber: string;
  email: string;
  totalBookedServices: number;
  address: string;
  totalBookingAmount: number;
  paymentMethod: string;
}

export interface BookingDetailResponse {
  bookingId: number;
  serviceId: number;
  serviceName: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  assignedPartnerId: number | null;
  assignedExpertName: string | null;
  assignedExpertImageUrl: string | null;
  status: string;
  bookingAmount: number;
  canChangeExpert: boolean;
  canComplete: boolean;
  canCancel: boolean;
  canDelete: boolean;
}

export interface AvailableExpertResponse {
  partnerId: number;
  fullName: string;
  profileImageUrl: string | null;
  serviceType: string;
  isVerified: boolean;
}

export interface FilterBookingRequestModel {
  serviceTypeId?: number | null;
  date?: string | null;
  time?: string | null;
  bookedServicesMin?: number | null;
  bookedServicesMax?: number | null;
  amountMin?: number | null;
  amountMax?: number | null;
  paymentMethod?: string | null;
  status?: string | null;
}

export interface ChangeExpertRequestModel {
  bookingId: number;
  newPartnerId: number;
}

export interface CancelBookingRequestModel {
  bookingId: number;
  reason: string;
}

export interface DataQueryResponseModel<T> {
  totalRecords: number;
  records: T[];
}

export interface FilterRangeMeta {
  maxAmount: number | null;
  maxBookedServices: number | null;
}

export interface FilteredDataQueryResponseModel<T> extends DataQueryResponseModel<T> {
  filterMeta: FilterRangeMeta;
}

export interface ExpandedBookingRow extends CustomerBookingSummaryResponse {
  details: BookingDetailResponse[];
  isExpanded: boolean;
  isLoadingDetails: boolean;
  isDetailsDirty: boolean;
}