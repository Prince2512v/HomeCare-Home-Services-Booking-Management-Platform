export interface ServiceTypes {
  id: number;
  image: string;
  title: string;
}

export interface PopularService {
  id: number;
  image: string;
  title: string;
  price: number;
  serviceTypeId: number;
  selectedCategoryName: string;
  isAvailable: boolean;
}

export interface AllService {
  id: number;
  image: string;
  title: string;
  price: number;
  serviceTypeId: number;
  selectedCategoryName: string;
  isAvailable: boolean;
}

export interface ServiceNames{
  id: number;
  name: string;
}

export interface DashboardCounts {
  totalUsers: number;
  totalServices: number;
}
