export type {
  GetServiceTypeResponseModel,
  GetCategoryResponseModel,
  GetSubCategoryResponseModel,
  CreateCategoryRequestModel,
  CreateSubCategoryRequestModel,
  DataQueryResponseModel,
  BaseResponse,
} from '../../master-data/models/master-data.model.js';

export interface GetServicesListResponseModel {
  id: number;
  name: string;
  subCategoryName: string;
  price: number;
  commission: number;
  isAvailable: boolean;
}

export interface ServiceImageResponseModel {
  id: number;
  imageUrl: string;
}

export interface ServiceFilterItemResponseModel {
  id: number;
  item: string;
}

export interface GetServiceByIdResponseModel {
  id: number;
  name: string;
  description: string | null;
  subCategoryId: number;
  subCategoryName: string;
  categoryName: string;
  serviceTypeName: string;
  duration: string;
  price: number;
  commission: number;
  isAvailable: boolean;
  images: ServiceImageResponseModel[];
  inclusionItems: ServiceFilterItemResponseModel[];
  exclusionItems: ServiceFilterItemResponseModel[];
}

export interface FilterServicesRequestModel {
  subCategoryId: number;
  filterSubCategoryId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isAvailable?: boolean | null;
  commission?: number | null;
  pageNumber: number;
  pageSize: number;
}

export interface SubCategoryWithServicesModel {
  id: number;
  subCategoryName: string;
  services: GetServicesListResponseModel[];
}

export interface CategoryWithServicesModel {
  id: number;
  categoryName: string;
  subCategories: SubCategoryWithServicesModel[];
}

export interface ServiceTypeFullDataModel {
  categories: CategoryWithServicesModel[];
}

export interface FilterRangeMeta {
  maxAmount: number | null;
}

export interface FilteredDataQueryResponseModel<T> {
  records: T[];
  totalRecords: number;
  filterMeta: FilterRangeMeta;
}