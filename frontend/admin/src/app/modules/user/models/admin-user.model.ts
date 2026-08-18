export interface GetAdminUserResponseModel {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  role: string | null;
  isActive: boolean;
}

export interface CreateAdminUserRequestModel {
  name: string;
  mobileNumber: string;
  email: string;
  isSuperAdmin: boolean;
  password: string;
  confirmPassword: string;
}

export interface UpdateAdminUserRequestModel {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  isSuperAdmin?: boolean;
  password?: string;
  confirmPassword?: string;
}

export interface ChangeAdminUserPasswordRequestModel {
  targetAdminId: number;
  password: string;
  confirmPassword: string;
}

export interface FilterAdminUserRequestModel {
  isSuperAdmin?: boolean | null;
  isActive?: boolean | null;
  pageNumber?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: string;
}

export interface PagedResult<T> {
  records: T[];
  totalRecords: number;
}