export interface AssignedPartner {
  id: number;
  fullName: string;
  profileImageUrl: string | null;
  totalJobsCompleted: number;
}

export interface BookingSuccessData {
  bookingId: number;
  bookingDate: string;
  bookingTime: string;
  bookingAmount: number;
  paymentMethod: string;
  serviceName?: string;
  categoryName?: string;
  durationMinutes?: number;
  serviceCategoryName?: string;
  serviceAddress?: string;
  servicePartnerName?: string;
  assignedPartner?: AssignedPartner;
}