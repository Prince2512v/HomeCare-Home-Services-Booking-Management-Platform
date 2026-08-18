import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  ConfirmationModel,
  ConfirmationModelConfig,
  PaginationComponent,
} from '@common';
import { ROUTES, DEFAULT_PAGINATION } from '@constants';
import { MobileNumberPipe } from '@pipe';
import { PaymentTransactionsService } from '../../services/payment-transactions.service.js';
import {
  TransactionDetailResponseModel,
  OtherTransactionItem,
} from '../../models/payment-transaction.model.js';

@Component({
  selector: 'app-payment-transaction-detail',
  standalone: true,
  imports: [CommonModule, ConfirmationModel, PaginationComponent, MobileNumberPipe],
  templateUrl: './payment-transaction-detail.html',
  styleUrl: './payment-transaction-detail.css',
})
export class PaymentTransactionDetail implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: PaymentTransactionsService,
    private toastr: ToastrService
  ) {}

  transactionId!: number;
  detail: TransactionDetailResponseModel | null = null;
  isDetailLoading = true;

  otherTransactions: OtherTransactionItem[] = [];
  isOtherLoading = false;
  otherCurrentPage = DEFAULT_PAGINATION.currentPage;
  otherItemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  otherTotalItems = DEFAULT_PAGINATION.totalItems;

  // Delete confirmation
  showDeleteModal = false;
  deleteTargetId: number | null = null;
  isDeleting = false;
  deleteConfirmConfig: ConfirmationModelConfig = {
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this transaction?',
    cancelText: 'Cancel',
    confirmText: 'Confirm',
  };

  ngOnInit(): void {
    this.transactionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetail();
  }

  loadDetail(): void {
    this.isDetailLoading = true;
    this.transactionService.getTransactionDetail(this.transactionId).subscribe({
      next: (res) => {
        this.detail = res.data;
        this.isDetailLoading = false;
        this.loadOtherTransactions();
      },
      error: (err) => {
        this.isDetailLoading = false;
        this.toastr.error(err?.error?.message || 'Failed to load transaction details.');
      },
    });
  }

  loadOtherTransactions(): void {
    if (!this.detail) return;
    this.isOtherLoading = true;
    this.transactionService
      .getTransactionsByUser(this.detail.userId, this.otherCurrentPage, this.otherItemsPerPage)
      .subscribe({
        next: (res) => {

          this.otherTransactions = res.data.records;
          this.otherTotalItems = res.data.totalRecords;
          this.isOtherLoading = false;
        },
        error: (err) => {
          this.isOtherLoading = false;
          this.toastr.error(err?.error?.message || 'Failed to load other transactions.');
        },
      });
  }

  changePage(page: number): void {
    this.otherCurrentPage = page;
    this.loadOtherTransactions();
  }

  changePageSize(size: number): void {
    this.otherItemsPerPage = +size;
    this.otherCurrentPage = 1;
    this.loadOtherTransactions();
  }

  onDeleteClick(id: number): void {
    this.deleteTargetId = id;
    this.showDeleteModal = true;
  }

  onDeleteConfirm(): void {
    if (this.deleteTargetId === null) return;
    const deletedId = this.deleteTargetId;
    this.isDeleting = true;
    this.transactionService.deleteTransaction(deletedId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.deleteTargetId = null;
        this.toastr.success('Transaction deleted successfully.');
        // If the deleted item was the current detail transaction, navigate bac
        if (deletedId === this.transactionId) {
          this.goBack();
        } else {
          this.loadOtherTransactions();
        }
      },
      error: (err) => {
        this.isDeleting = false;
        this.toastr.error(err?.error?.message || 'Failed to delete transaction.');
      },
    });
  }

  onDeleteCancel(): void {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
  }

  goBack(): void {
    this.router.navigate([ROUTES.PAYMENT_TRANSACTIONS.PAYMENT_TRANSACTIONS_ABSOLUTE]);
  }

  formatAmount(amount: number): string {
    return `+$${amount.toFixed(2)}`;
  }
}