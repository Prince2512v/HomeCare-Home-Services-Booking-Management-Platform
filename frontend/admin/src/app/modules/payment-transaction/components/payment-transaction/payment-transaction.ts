import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button, ButtonInputConfig, FilterPanel, FilterPanelConfig, FilterValues, PaginationComponent } from '@common';
import { DEFAULT_PAGINATION, ROUTES } from '@constants';
import { MobileNumberPipe } from '@pipe';
import { PaymentTransactionsService } from '../../services/payment-transactions.service.js';
import { GetTransactionResponseModel, FilterTransactionRequestModel } from '../../models/payment-transaction.model.js';

@Component({
  selector: 'app-payment-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, PaginationComponent, FilterPanel, MobileNumberPipe],
  templateUrl: './payment-transaction.html',
  styleUrl: './payment-transaction.css',
})
export class PaymentTransactions implements OnInit {
  constructor(
    private transactionService: PaymentTransactionsService,
    private router: Router
  ) { }

  transactions: GetTransactionResponseModel[] = [];

  isLoading = false;
  errorMessage = '';

  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  activeFilter?: FilterTransactionRequestModel;
  private amountMax: number = 99999;

  filterPanelConfig!: FilterPanelConfig;
  filterConfig!: ButtonInputConfig;

  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentPage: number = DEFAULT_PAGINATION.currentPage;
  itemsPerPage: number = DEFAULT_PAGINATION.itemsPerPage;
  totalItems: number = DEFAULT_PAGINATION.totalItems;

  ngOnInit(): void {
    this.initConfigs();
    this.loadTransactions();
  }

  private initConfigs(): void {
    this.filterConfig = {
      variant: 'filter',
      type: 'button',
      cssClass: 'btn-filter',
      onClick: () => this.onFilter(),
    };

    this.filterPanelConfig = {
      fields: [
        {
          key: 'amount',
          label: 'Amount Range',
          type: 'price-range',
          min: 0,
          max: this.amountMax,
          step: 10,
          prefix: '$',
        },
        {
          key: 'paymentMethod',
          label: 'Payment Method',
          type: 'select',
          placeholder: 'All Methods',
          options: [
            { value: 'Card', label: 'Card' },
            { value: 'Cash', label: 'Cash' },
          ],
        },
      ],
      onFilter: (values: FilterValues) => this.applyFilter(values),
      onCancel: () => this.cancelFilter(),
    };
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService
      .getTransactions({
        ...this.activeFilter,
        pageNumber: this.currentPage,
        pageSize: this.itemsPerPage,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
      })
      .subscribe({
        next: (res) => {
          this.transactions = res.data.records;
          this.totalItems = res.data.totalRecords;
          const backendMax = res.data.filterMeta?.maxAmount;
          if (backendMax !== null && backendMax !== undefined && backendMax > 0) {
            this.amountMax = Math.ceil(backendMax);
            this.initConfigs();
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message;
        },
      });
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadTransactions();
  }

  onFilter(): void {
    this.isFilterOpen = true;
  }

  applyFilter(values: FilterValues): void {
    this.activeFilterValues = { ...values };
    this.activeFilter = {
      minAmount: (values['amount_min'] as number) ?? null,
      maxAmount: (values['amount_max'] as number) ?? null,
      paymentMethod: (values['paymentMethod'] as string) || null,
    };
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.loadTransactions();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilter = undefined;
    this.activeFilterValues = null;
    this.currentPage = 1;
    this.loadTransactions();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  changePageSize(size: number): void {
    this.itemsPerPage = +size;
    this.currentPage = 1;
    this.loadTransactions();
  }

  openDetail(id: number): void {
    this.router.navigate([ROUTES.PAYMENT_TRANSACTIONS.DETAIL_ABSOLUTE, id]);
  }
}