import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth';
import { Address } from '@profile';
import { ActivatedRoute, Router } from '@angular/router';
import {ROUTES, PAYMENT_METHODS } from '@constants';
import { BookingSuccessStateService } from '@services';
import { SlotSelection } from '../checkout/Models/checkout.models.js';
import { BookingSuccessData } from '../../modules/booking-success/models/booking-success.models';
import { BookingFor } from './components/booking-for/booking-for';
import { SelectAddress } from './components/select-address/select-address';
import { SelectPayment } from './components/select-payment/select-payment';
import { SelectSlot } from './components/select-slot/select-slot';
import { PaymentSummary } from './components/payment-summary/payment-summary.js';
import { StripeCardModal } from './components/stripe-card-model/stripe-card-model.js';
import { CheckoutService } from './services/checkout.service.js';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    BookingFor,
    SelectAddress,
    SelectPayment,
    SelectSlot,
    PaymentSummary,
    StripeCardModal,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private transactionService = inject(CheckoutService);

  protected readonly PAYMENT_METHODS = PAYMENT_METHODS;

  selectedAddress: Address | null = null;
  selectedSlot: SlotSelection | null = null;
  selectedPayment: string | null = null;

  serviceId: number | null = null;
  serviceTypeId: number | null = null;
  serviceName: string = '';
  categoryName: string = '';
  totalAmount: number | null = null;
  sericeDuration: number | null = null;

  showRazorpayModal = false;
  isCashProcessing = false;
  cashError: string | null = null;
  blockedError: string | null = null;

  successData: BookingSuccessData | null = null;

  isPartnerAvailable = false;
  appliedOfferId: number | null = null;

  private _allStepsEverCompleted = false;
  private bookingSuccessState = inject(BookingSuccessStateService);

  ngOnInit(): void {
    this.loadParams();
  }

  loadParams() {
    this.route.queryParams.subscribe((params) => {
      const sid = Number(params['serviceId']);
      const stid = Number(params['serviceTypeId']);
      this.serviceId = sid > 0 ? sid : null;
      this.serviceTypeId = stid > 0 ? stid : null;
      this.serviceName = params['serviceName'] ?? '';
      this.categoryName = params['categoryName'] ?? '';
    });
  }

  get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  get isAddressDone(): boolean {
    return !!this.selectedAddress;
  }

  get isSlotDone(): boolean {
    return !!this.selectedSlot && this.isPartnerAvailable;
  }

  get isPaymentDone(): boolean {
    return !!this.selectedPayment;
  }

  get showActionButton(): boolean {
    if (this.isPaymentDone) return true;
    return this._allStepsEverCompleted && this.isAddressDone;
  }

  get actionPaymentMethod(): string | null {
    return this.selectedPayment;
  }

  get step1State(): 'inactive' | 'active' | 'done' {
    return this.isLoggedIn ? 'done' : 'active';
  }

  get step2State(): 'inactive' | 'active' | 'done' {
    if (!this.isLoggedIn) return 'inactive';
    if (this.isAddressDone) return 'done';
    return 'active';
  }

  get step3State(): 'inactive' | 'active' | 'done' {
    if (!this.isAddressDone) return 'inactive';
    if (this.isSlotDone) return 'done';
    return 'active';
  }

  get step4State(): 'inactive' | 'active' | 'done' {
    if (!this.isSlotDone) return 'inactive';
    if (this.isPaymentDone) return 'done';
    return 'active';
  }

  onAddressSelected(address: Address): void {
    this.selectedAddress = address;
  }

  onSlotSaved(slot: SlotSelection): void {
    this.selectedSlot = slot;
  }

  onPartnerAvailableChange(available: boolean): void {
    this.isPartnerAvailable = available;
  }

  onPaymentSaved(method: string): void {
    this.selectedPayment = method;
    if (this.isAddressDone && this.isSlotDone) {
      this._allStepsEverCompleted = true;
    }
  }

  onTotalAmountChange(amount: number): void {
    this.totalAmount = amount;
  }

  onAppliedOfferIdChange(offerId: number | null): void {
    this.appliedOfferId = offerId;
  }

  onPayButtonClick(): void {
    if (!this.selectedAddress || !this.selectedSlot) return;
    this.cashError = null;
    this.blockedError = null;
    if (this.selectedPayment === PAYMENT_METHODS.CASH) {
      this.onPlaceOrder();
    } else {
      this.onPay();
    }
  }

  onPlaceOrder(): void {
    const address = this.selectedAddress;
    const slot = this.selectedSlot;
    if (!address || !slot || !this.serviceId || !this.serviceTypeId) return;

    this.isCashProcessing = true;
    this.cashError = null;

    this.transactionService
      .createCashBooking({
        serviceId: this.serviceId,
        serviceTypeId: this.serviceTypeId,
        addressId: Number(address.addressId),
        bookingDate: slot.bookingDate,
        bookingTime: slot.bookingTime,
        offerId: this.appliedOfferId ?? null,
      })
      .subscribe({
        next: (res) => {
          this.isCashProcessing = false;
          this.bookingSuccessState.setBookingData({
            bookingId: res.data.id,
            bookingDate: res.data.bookingDate,
            bookingTime: res.data.bookingTime,
            bookingAmount: res.data.bookingAmount,
            paymentMethod: 'Cash',
            serviceName: this.serviceName,
            serviceCategoryName: this.categoryName,
            durationMinutes: res.data.durationMinutes,
            serviceAddress: this.selectedAddress?.fullAddress ?? '',
            assignedPartner: res.data.assignedPartner,
          });
          this.router.navigate([
            ROUTES.CUSTOMER.BOOKING_SUCCESS.BOOKING_SUCCESS_ABSOLUTE,
          ]);
        },
        error: (err) => {
          this.isCashProcessing = false;
          const message: string = err?.error?.message ?? '';
          if (message.toLowerCase().includes('blocked')) {
            this.blockedError = message;
          } else {
            this.cashError = message;
          }
        },
      });
  }
  onIntentFailed(message: string): void {
    this.showRazorpayModal = false;
    this.blockedError = message;
  }

  onPay(): void {
    if (!this.selectedAddress || !this.selectedSlot || !this.isPartnerAvailable)
      return;
    this.showRazorpayModal = true;
  }

  onBookingConfirmed(data: BookingSuccessData): void {
    this.showRazorpayModal = false;
    this.bookingSuccessState.setBookingData({
      ...data,
      serviceName: this.serviceName,
      serviceCategoryName: this.categoryName,
      serviceAddress: this.selectedAddress?.fullAddress ?? '',
      durationMinutes: data.durationMinutes,
    });
    this.router.navigate([
      ROUTES.CUSTOMER.BOOKING_SUCCESS.BOOKING_SUCCESS_ABSOLUTE,
    ]);
  }

  onStripeModalClose(): void {
    this.showRazorpayModal = false;
  }
}