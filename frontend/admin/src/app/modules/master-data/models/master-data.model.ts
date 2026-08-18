export interface GetServiceTypeResponseModel {
  id: number;
  serviceName: string;
}

export interface DataQueryResponseModel<T> {
  totalRecords: number;
  records: T[];
}

export interface BaseResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
// -------- Category --------

export interface GetCategoryResponseModel {
  id: number;
  categoryName: string;
  serviceTypeId: number;
}

export interface CreateCategoryRequestModel {
  categoryname: string;
  serviceTypeId: number;
}
// -------- SubCategory --------
export interface GetSubCategoryResponseModel {
  id: number;
  subCategoryName: string;
  categoryId: number;
}

export interface CreateSubCategoryRequestModel {
  subcategoryname: string;
  categoryId: number;
}
// -------- Shared Response Wrapper --------
export interface DataQueryResponseModel<T> {
  totalRecords: number;
  records: T[];
}

export interface BaseResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
