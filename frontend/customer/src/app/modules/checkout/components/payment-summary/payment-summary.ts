import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '@models';
import { CommonModal } from '@common';
import { CheckoutService, CheckoutSummary, ActiveOffer } from '@checkout';
import { AuthService } from '@auth';
import { ToastrService } from 'ngx-toastr';
import { DiscountPipe } from '@pipes';

const MAX_COUPON_USAGE = 10;
const COUPON_STORAGE_KEY = 'hc_applied_coupon';

@Component({
  selector: 'app-payment-summary',
  imports: [CommonModule, CommonModal, DiscountPipe],
  templateUrl: './payment-summary.html',
  styleUrl: './payment-summary.css',
})
export class PaymentSummary implements OnChanges, AfterViewInit {
  @ViewChild('carousel', { static: false }) carousel!: ElementRef;
  @Input() serviceId: number | null = null;
  @Input() serviceName = '';
  @Output() totalAmountChange = new EventEmitter<number>();
  @Output() appliedOfferIdChange = new EventEmitter<number | null>();

  showLeftArrow = false;
  showRightArrow = true;

  summary: CheckoutSummary | null = null;
  summaryLoading = false;

  activeOffers: ActiveOffer[] = [];
  appliedOffer: ActiveOffer | null = null;

  couponState: 'idle' | 'loading' | 'applied' | 'error' = 'idle';
  loadingOfferId: number | null = null;

  showAllOffersModal = false;

  private svc = inject(CheckoutService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceId'] && this.serviceId) {
      this.clearPersistedCoupon();
      this.loadActiveOffers();
    }
  }

  get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  private emitTotal(): void {
    if (this.summary) {
      this.totalAmountChange.emit(this.summary.totalAmount);
    }
  }

  private emitAppliedOfferId(): void {
    this.appliedOfferIdChange.emit(this.appliedOffer?.id ?? null);
  }

  private loadSummary(): void {
    if (!this.serviceId) return;

    this.summaryLoading = true;

    this.svc.getCheckoutSummary(this.serviceId).subscribe({
      next: (res: ApiResponse<CheckoutSummary>) => {
        this.summary = res.data;
        this.summaryLoading = false;
        this.emitTotal();
        this.emitAppliedOfferId();
      },
      error: (err: any) => {
        this.summaryLoading = false;
        this.toastr.error(err?.error?.message);
      },
    });
  }

  private loadActiveOffers(): void {
    this.svc.getActiveOffers().subscribe({
      next: (res: ApiResponse<ActiveOffer[]>) => {
        this.activeOffers = (res.data ?? []).filter(
          (o) => o.appliedCount < MAX_COUPON_USAGE,
        );
        this.loadSummary();
      },
      error: () => {
        // offers endpoint not available — continue without offers
        this.activeOffers = [];
        this.loadSummary();
      },
    });
  }

  private persistCoupon(): void {
    if (!this.serviceId || !this.appliedOffer || !this.summary) return;
    localStorage.setItem(
      `${COUPON_STORAGE_KEY}_${this.serviceId}`,
      JSON.stringify({ offer: this.appliedOffer, summary: this.summary }),
    );
  }

  private clearPersistedCoupon(): void {
    if (!this.serviceId) return;
    localStorage.removeItem(`${COUPON_STORAGE_KEY}_${this.serviceId}`);
  }

  openViewAll(): void {
    this.showAllOffersModal = true;
  }

  closeViewAll(): void {
    this.showAllOffersModal = false;
  }

  addCoupon(offer: ActiveOffer): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Sign in is required to apply a coupon.');
      return;
    }

    if (!this.serviceId) return;

    this.couponState = 'loading';
    this.loadingOfferId = offer.id;

    this.svc
      .validateCoupon({
        serviceId: this.serviceId,
        offerId: offer.id,
      })
      .subscribe({
        next: (res: ApiResponse<CheckoutSummary>) => {
          this.summary = res.data;
          this.appliedOffer = offer;
          this.couponState = 'applied';
          this.loadingOfferId = null;
          this.persistCoupon();
          this.closeViewAll();
          this.emitTotal();
          this.emitAppliedOfferId();
          this.toastr.success(res.message);
        },
        error: (err: any) => {
          this.couponState = 'error';
          this.loadingOfferId = null;
          this.toastr.error(err?.error?.message);
        },
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.checkArrows());
  }

  scrollLeft(): void {
    this.carousel.nativeElement.scrollBy({ left: -250, behavior: 'smooth' });
    setTimeout(() => this.checkArrows(), 200);
  }

  scrollRight(): void {
    this.carousel.nativeElement.scrollBy({ left: 250, behavior: 'smooth' });
    setTimeout(() => this.checkArrows(), 200);
  }

  onScroll(): void {
    this.checkArrows();
  }

  checkArrows(): void {
    if (!this.carousel?.nativeElement) return;
    const el = this.carousel.nativeElement;
    this.showLeftArrow = el.scrollLeft > 0;
    this.showRightArrow = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  }

  removeCoupon(): void {
    this.resetCoupon();
    this.loadSummary();
  }

  private resetCoupon(): void {
    this.clearPersistedCoupon();
    this.appliedOffer = null;
    this.couponState = 'idle';
    this.loadingOfferId = null;
    this.emitAppliedOfferId();
  }

  get hasCouponApplied(): boolean {
    return this.couponState === 'applied';
  }

  get hasOffers(): boolean {
    return this.activeOffers.length > 0;
  }

  isApplying(offerId: number): boolean {
    return this.couponState === 'loading' && this.loadingOfferId === offerId;
  }

  isOfferApplied(offerId: number): boolean {
    return this.hasCouponApplied && this.appliedOffer?.id === offerId;
  }
}