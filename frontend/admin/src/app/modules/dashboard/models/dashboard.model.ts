export interface MetricCardModel {
  currentValue: number;
  previousValue: number;
  changePercent: number;
  isIncrease: boolean;
}

export interface DashboardSummaryModel {
  totalServicesBooked: MetricCardModel;
  activeUsers: MetricCardModel;
  activeServicePartners: MetricCardModel;
  totalRevenue: MetricCardModel;
}

export interface BookingByServiceTypeModel {
  serviceTypeId: number;
  serviceTypeName: string;
  bookingCount: number;
}

export interface WeeklyRevenueModel {
  dayName: string;
  revenue: number;
}

export interface DailyBookingPointModel {
  dayName: string;
  bookingCount: number;
}

export interface CityBookingModel {
  cityName: string;
  points: DailyBookingPointModel[];
}

export interface TopServicePartnerModel {
  id: number;
  fullName: string;
  profileImageUrl: string | null;
  serviceTypeName: string;
  totalJobsCompleted: number;
}

export interface DashboardHomeModel {
  summary: DashboardSummaryModel;
  bookingsByServiceType: BookingByServiceTypeModel[];
  revenue: WeeklyRevenueModel[];
  topServicePartners: TopServicePartnerModel[];
}

export interface CityBookingsModel {
  cities: CityBookingModel[];
}