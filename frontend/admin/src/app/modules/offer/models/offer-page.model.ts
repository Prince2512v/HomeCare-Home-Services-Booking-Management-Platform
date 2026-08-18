export interface GetOfferResponseModel {
  id: number;
  couponCode: string;
  couponDescription: string;
  discountPercentage: number;
  appliedCount: number;
  isActive: boolean;
}

export interface CreateOfferRequestModel {
  couponCode: string;
  couponDescription: string;
  discountPercentage: number;
  isActive: boolean;
}

export interface DataQueryResponseModel<T> {
  totalRecords: number;
  records: T[];
  filterMeta?: FilterRangeMeta | null;
}

export interface UpdateOfferRequestModel {
  id: number;
  couponCode: string;
  couponDescription: string;
  discountPercentage: number;
  isActive: boolean;
}

export interface FilterOfferRequestModel {
  discountPercentage?: number | null;
  appliedCountMin?: number | null;
  appliedCountMax?: number | null;
  availability?: boolean | null;
  sortField?: string | null;
  sortDirection?: string | null;
}

export interface FilterRangeMeta {
  maxAmount?: number | null;
  maxBookedServices?: number | null;
  maxBookingCount?: number | null;
}
