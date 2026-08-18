export interface PaginationRequest {
    page: number;
    pageSize: number;
  }

  export interface PaginationResponse<T> {
    totalRecords: number;
    records: T[];
  }