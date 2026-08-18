export interface GetCustomerResponseModel {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  pendingBookings: number;
  totalBookings: number;
  status: string;
}

export interface CreateCustomerRequestModel {
  name: string;
  mobileNumber: string;
  email: string;
}

export interface FilterCustomerRequestModel {
  bookingMin?: number | null;
  bookingMax?: number | null;
  status?: string | null;
  pageNumber: number;
  pageSize: number;
  sortField?: string | null;
  sortDirection?: string | null;
}

export interface FilterRangeMeta {
  maxAmount?: number | null;
  maxBookedServices?: number | null;
  maxBookingCount?: number | null;
}

export interface CustomerQueryResponseModel {
  records: GetCustomerResponseModel[];
  totalRecords: number;
  filterMeta: FilterRangeMeta;
}

export interface CustomerDetailResponse {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  status: string;
}

export interface CustomerBookingDetailResponse {
  bookingId: number;
  serviceId: number;
  serviceName: string;
  serviceType: string;
  serviceTypeId: number | null;
  address: string;
  bookingDate: string;
  bookingTime: string;
  bookingAmount: number;
  paymentMethod: string;
  status: string;

  assignedPartnerId: number | null;
  assignedExpertName: string | null;
  assignedExpertImageUrl: string | null;

  canChangeExpert: boolean;
  canComplete: boolean;
  canCancel: boolean;
  canDelete: boolean;
}

export interface CustomerBookingsResponseModel {
  records: CustomerBookingDetailResponse[];
  totalRecords: number;
  filterMeta: CustomerBookingFilterMeta;
}

export interface CustomerBookingFilterMeta {
  maxAmount: number | null;
}

export interface FilterCustomerBookingsRequestModel {
  pageNumber: number;
  pageSize: number;
  sortField?: string | null;
  sortDirection?: string | null;
  serviceTypeId?: number | null;
  date?: string | null;
  time?: string | null;
  amountMin?: number | null;
  amountMax?: number | null;
  paymentMethod?: string | null;
  status?: string | null;
}