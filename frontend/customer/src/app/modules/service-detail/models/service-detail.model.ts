import { AllService } from '../../homepage/models/service.model';

export interface ServiceDetail {
  id: number;
  title: string;
  price: number;
  serviceTypeId: number;
  serviceTypeName: string;
  serviceCategoryName: string;
  categoryName: string;
  images: string[];
  inclusions: string[];
  exclusions: string[];
  relatedServices: AllService[];
}