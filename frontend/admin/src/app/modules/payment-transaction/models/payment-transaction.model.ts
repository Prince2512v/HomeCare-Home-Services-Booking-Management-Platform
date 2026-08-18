export interface GetTransactionResponseModel {
  id: number;
  transactionId: string;
  userName: string;
  mobileNumber: string;
  serviceName: string;
  transactionAmount: number;
  paymentMethod: string;
  transactionDate: string;
}

export interface FilterTransactionRequestModel {
  [key: string]: unknown;
  minAmount?: number | null;
  maxAmount?: number | null;
  paymentMethod?: string | null;
  pageNumber?: number;
  pageSize?: number;
  sortField?: string | null;
  sortDirection?: string | null;
}

export interface DataQueryResponseModel<T> {
  records: T[];
  totalRecords: number;
  filterMeta?: { maxAmount?: number };
}

export interface TransactionDetailResponseModel {
  id: number;
  userId: number;
  userName: string;
  mobileNumber: string;
  transactionId: string;
  serviceName: string;
  serviceId: string;
  transactionAmount: number;
  paymentType: string;
  paymentMethod: string;
  transactionDate: string;
}

export interface OtherTransactionItem {
  id: number;
  transactionId: string;
  serviceName: string;
  transactionAmount: number;
  paymentMethod: string;
}

export interface OtherTransactionsResponseModel {
  records: OtherTransactionItem[];
  totalRecords: number;
}