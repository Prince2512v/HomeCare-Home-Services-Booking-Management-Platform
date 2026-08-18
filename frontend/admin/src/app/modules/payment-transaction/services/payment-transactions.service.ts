import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import {
  GetTransactionResponseModel,
  FilterTransactionRequestModel,
  DataQueryResponseModel,
  TransactionDetailResponseModel,
  OtherTransactionsResponseModel,
} from '../models/payment-transaction.model.js';

@Injectable({
  providedIn: 'root',
})
export class PaymentTransactionsService {
  private apiService = inject(ApiService);

  getTransactions(
    filter: FilterTransactionRequestModel
  ): Observable<ApiResponse<DataQueryResponseModel<GetTransactionResponseModel>>> {
    const params: Record<string, string> = {};

    Object.keys(filter).forEach((key) => {
      const val = filter[key];
      if (val !== null && val !== undefined && val !== '') {
        params[key] = String(val);
      }
    });

    return this.apiService.get<DataQueryResponseModel<GetTransactionResponseModel>>(
      API_ROUTES.TRANSACTIONS.LIST,
      params
    );
  }

  getTransactionDetail(id: number): Observable<ApiResponse<TransactionDetailResponseModel>> {
    const url = API_ROUTES.TRANSACTIONS.GET_BY_ID.replace(':id', String(id));
    return this.apiService.get<TransactionDetailResponseModel>(url);
  }

  deleteTransaction(id: number): Observable<ApiResponse<void>> {
    const url = API_ROUTES.TRANSACTIONS.DELETE.replace(':id', String(id));
    return this.apiService.delete<void>(url);
  }

  getTransactionsByUser(
    userId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<ApiResponse<OtherTransactionsResponseModel>> {
    const url = API_ROUTES.TRANSACTIONS.BY_USER.replace(':id', String(userId));
    return this.apiService.get<OtherTransactionsResponseModel>(url, {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
  }
}