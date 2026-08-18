import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Address } from '@profile';
import { CheckoutService } from '../../services/checkout.service.js';
import { SlotSelection } from '../../Models/checkout.models.js';
import { BookingSuccessData } from '../../../booking-success/models/booking-success.models.js';

// Declare Razorpay global from the CDN script
declare const Razorpay: any;

@Component({
  selector: 'app-stripe-card-model',  // keeping selector to avoid changing checkout.html references
  imports: [CommonModule],
  templateUrl: './stripe-card-model.html',
  styleUrl: './stripe-card-model.css',
})
export class StripeCardModal implements OnInit, OnDestroy {
  @Input() serviceId!: number;
  @Input() serviceTypeId!: number;
  @Input() address!: Address;
  @Input() slot!: SlotSelection;
  @Input() offerId: number | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() bookingConfirmed = new EventEmitter<BookingSuccessData>();
  @Output() intentFailed = new EventEmitter<string>();

  private transactionService = inject(CheckoutService);
  private razorpayInstance: any = null;

  isLoadingIntent = true;
  intentError: string | null = null;
  isProcessing = false;

  amount: number = 0;
  currency: string = 'INR';
  razorpayOrderId: string | null = null;
  keyId: string | null = null;

  ngOnInit(): void {
    this.createRazorpayOrder();
  }

  ngOnDestroy(): void {
    this.razorpayInstance?.close?.();
  }

  // ─── Step 1: Create Razorpay Order via backend ───────────────────────────────

  private createRazorpayOrder(): void {
    this.isLoadingIntent = true;
    this.intentError = null;

    const payload = {
      serviceId: this.serviceId,
      serviceTypeId: this.serviceTypeId,
      addressId: Number(this.address.addressId),
      bookingDate: this.slot.bookingDate,
      bookingTime: this.slot.bookingTime,
      offerId: this.offerId ?? null,
    };

    this.transactionService.createIntent(payload).subscribe({
      next: (res) => {
        this.razorpayOrderId = res.data.razorpayOrderId;
        this.keyId = res.data.keyId;
        this.amount = res.data.amount;
        this.currency = res.data.currency;
        this.isLoadingIntent = false;
        this.openRazorpayPopup();
      },
      error: (err) => {
        this.intentError = err?.error?.message ?? 'Payment could not be initiated.';
        this.isLoadingIntent = false;
        this.intentFailed.emit(this.intentError!);
      },
    });
  }

  // ─── Step 2: Open Razorpay Checkout popup ────────────────────────────────────

  private openRazorpayPopup(): void {
    if (!this.razorpayOrderId || !this.keyId) return;

    if (typeof Razorpay === 'undefined') {
      this.intentError = 'Razorpay SDK failed to load. Please check your internet connection.';
      this.intentFailed.emit(this.intentError);
      return;
    }

    const options = {
      key: this.keyId,
      amount: Math.round(this.amount * 100),   // paise
      currency: this.currency,
      name: 'HomeCare',
      description: 'Home Service Payment',
      order_id: this.razorpayOrderId,
      image: 'assets/images/logo.png',
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#4540e1',
      },
      modal: {
        ondismiss: () => {
          // User closed without paying
          this.onPaymentDismissed();
        },
      },
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        this.onPaymentSuccess(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
    };

    this.razorpayInstance = new Razorpay(options);
    this.razorpayInstance.on('payment.failed', (response: any) => {
      this.onPaymentFailed(response?.error?.description ?? 'Payment failed.');
    });

    this.razorpayInstance.open();
  }

  // ─── Step 3a: Payment succeeded → verify on backend ─────────────────────────

  private onPaymentSuccess(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): void {
    this.isProcessing = true;

    this.transactionService
      .confirmPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature })
      .subscribe({
        next: (res) => {
          this.isProcessing = false;
          this.bookingConfirmed.emit({
            bookingId: res.data.id,
            bookingDate: res.data.bookingDate,
            bookingTime: res.data.bookingTime,
            bookingAmount: res.data.bookingAmount,
            paymentMethod: 'Razorpay',
            durationMinutes: res.data.durationMinutes,
            assignedPartner: res.data.assignedPartner,
          });
        },
        error: (err) => {
          this.isProcessing = false;
          this.intentError = err?.error?.message ?? 'Confirmation failed. Contact support.';
        },
      });
  }

  // ─── Step 3b: Payment failed ─────────────────────────────────────────────────

  private onPaymentFailed(message: string): void {
    if (this.razorpayOrderId) {
      this.transactionService
        .recordFailedTransaction({ paymentIntentId: this.razorpayOrderId })
        .subscribe({ error: () => {} });
    }
    this.intentFailed.emit(message);
  }

  // ─── Step 3c: User dismissed the popup ───────────────────────────────────────

  private onPaymentDismissed(): void {
    if (this.razorpayOrderId) {
      this.transactionService
        .recordFailedTransaction({ paymentIntentId: this.razorpayOrderId })
        .subscribe({ error: () => {} });
    }
    this.close.emit();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  formatAmount(amount: number, currency: string): string {
    const symbol = currency?.toLowerCase() === 'inr' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }

  onCancel(): void {
    this.razorpayInstance?.close?.();
    this.close.emit();
  }
}