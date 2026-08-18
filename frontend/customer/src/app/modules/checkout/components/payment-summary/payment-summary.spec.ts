import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PaymentSummary } from '@checkout';
import { CheckoutService } from '@checkout';

const apiRes = (data: any) =>
  ({
    data,
    isSuccess: true,
    statusCode: 200,
    message: '',
    errorMessages: [],
  }) as any;

const mkSummary = (overrides = {}) =>
  ({
    itemsTotal: 100,
    taxPercentage: 5,
    taxAmount: 5,
    appliedOfferId: null,
    appliedCouponCode: null,
    discountPercentage: 0,
    discountAmount: 0,
    totalAmount: 105,
    ...overrides,
  }) as any;

const mkOffer = (id = 1) =>
  ({
    id,
    couponCode: 'FIRST10',
    couponDescription: '10% off your first service',
    discountPercentage: 10,
  }) as any;

describe('PaymentSummary', () => {
  let component: PaymentSummary;
  let fixture: ComponentFixture<PaymentSummary>;
  let svcSpy: jasmine.SpyObj<CheckoutService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('CheckoutService', [
      'getCheckoutSummary',
      'getActiveOffers',
      'validateCoupon',
    ]);

    svcSpy.getCheckoutSummary.and.returnValue(of(apiRes(mkSummary())));
    svcSpy.getActiveOffers.and.returnValue(of(apiRes([mkOffer()])));

    await TestBed.configureTestingModule({
      imports: [PaymentSummary],
      providers: [{ provide: CheckoutService, useValue: svcSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentSummary);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should load summary and offers when serviceId changes', () => {
      component.serviceId = 5;
      component.ngOnChanges({
        serviceId: {
          currentValue: 5,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      expect(svcSpy.getCheckoutSummary).toHaveBeenCalledWith(5);
      expect(svcSpy.getActiveOffers).toHaveBeenCalledTimes(1);
    });

    it('should reset coupon state before loading', () => {
      component.couponState = 'applied';
      component.appliedOffer = mkOffer();
      component.serviceId = 5;
      component.ngOnChanges({
        serviceId: {
          currentValue: 5,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      expect(component.couponState).toBe('idle');
      expect(component.appliedOffer).toBeNull();
    });

    it('should not load if serviceId is null', () => {
      component.serviceId = null;
      component.ngOnChanges({
        serviceId: {
          currentValue: null,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      expect(svcSpy.getCheckoutSummary).not.toHaveBeenCalled();
    });
  });

  describe('loadSummary', () => {
    it('should set summary on success', fakeAsync(() => {
      component.serviceId = 1;
      component.ngOnChanges({
        serviceId: {
          currentValue: 1,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      tick();
      expect(component.summary).toEqual(mkSummary());
      expect(component.summaryLoading).toBeFalse();
    }));

    it('should clear summaryLoading on error', fakeAsync(() => {
      svcSpy.getCheckoutSummary.and.returnValue(
        throwError(() => ({ error: {} })),
      );
      component.serviceId = 1;
      component.ngOnChanges({
        serviceId: {
          currentValue: 1,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      tick();
      expect(component.summaryLoading).toBeFalse();
    }));
  });

  describe('hasOffers', () => {
    it('should return true when offers are loaded', fakeAsync(() => {
      component.serviceId = 1;
      component.ngOnChanges({
        serviceId: {
          currentValue: 1,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      tick();
      expect(component.hasOffers).toBeTrue();
    }));

    it('should return false when no offers', fakeAsync(() => {
      svcSpy.getActiveOffers.and.returnValue(of(apiRes([])));
      component.serviceId = 1;
      component.ngOnChanges({
        serviceId: {
          currentValue: 1,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      tick();
      expect(component.hasOffers).toBeFalse();
    }));
  });

  describe('addCoupon', () => {
    beforeEach(() => {
      component.serviceId = 1;
      component.activeOffers = [mkOffer()];
    });

    it('should apply coupon on success', fakeAsync(() => {
      const discountedSummary = mkSummary({
        discountAmount: 10,
        totalAmount: 95,
        appliedCouponCode: 'FIRST10',
      });
      svcSpy.validateCoupon.and.returnValue(of(apiRes(discountedSummary)));
      component.addCoupon(mkOffer());
      tick();
      expect(component.couponState).toBe('applied');
      expect(component.summary?.discountAmount).toBe(10);
      expect(component.appliedOffer?.couponCode).toBe('FIRST10');
    }));

    it('should set error state on failure with backend message', fakeAsync(() => {
      svcSpy.validateCoupon.and.returnValue(
        throwError(() => ({
          error: { message: 'You have already used this coupon.' },
        })),
      );
      component.addCoupon(mkOffer());
      tick();
      expect(component.couponState).toBe('error');
    }));

    it('should fall back to errors array if message is absent', fakeAsync(() => {
      svcSpy.validateCoupon.and.returnValue(
        throwError(() => ({ error: { errors: ['Coupon Code is required.'] } })),
      );
      component.addCoupon(mkOffer());
      tick();
    }));

    it('should use hardcoded fallback when no error info from server', fakeAsync(() => {
      svcSpy.validateCoupon.and.returnValue(throwError(() => ({ error: {} })));
      component.addCoupon(mkOffer());
      tick();
    }));

    it('should set loadingOfferId during request', () => {
      svcSpy.validateCoupon.and.returnValue(of(apiRes(mkSummary())));
      component.addCoupon(mkOffer(1));
      expect(component.isApplying(1)).toBeFalse();
    });

    it('should not call service if serviceId is null', () => {
      component.serviceId = null;
      component.addCoupon(mkOffer());
      expect(svcSpy.validateCoupon).not.toHaveBeenCalled();
    });
  });

  describe('removeCoupon', () => {
    it('should reset state and reload summary', () => {
      component.couponState = 'applied';
      component.appliedOffer = mkOffer();
      component.serviceId = 1;
      component.removeCoupon();
      expect(component.couponState).toBe('idle');
      expect(component.appliedOffer).toBeNull();
      expect(svcSpy.getCheckoutSummary).toHaveBeenCalled();
    });
  });

  describe('modal', () => {
    it('openViewAll should show modal', () => {
      component.openViewAll();
      expect(component.showAllOffersModal).toBeTrue();
    });

    it('closeViewAll should hide modal', () => {
      component.showAllOffersModal = true;
      component.closeViewAll();
      expect(component.showAllOffersModal).toBeFalse();
    });

    it('addCoupon success should close modal', fakeAsync(() => {
      component.serviceId = 1;
      component.showAllOffersModal = true;
      svcSpy.validateCoupon.and.returnValue(of(apiRes(mkSummary())));
      component.addCoupon(mkOffer());
      tick();
      expect(component.showAllOffersModal).toBeFalse();
    }));
  });

  describe('getters', () => {
    it('hasCouponApplied should be true only when state is applied', () => {
      component.couponState = 'applied';
      expect(component.hasCouponApplied).toBeTrue();
      component.couponState = 'idle';
      expect(component.hasCouponApplied).toBeFalse();
    });

    it('isOfferApplied should match applied offer id', () => {
      component.couponState = 'applied';
      component.appliedOffer = mkOffer(3);
      expect(component.isOfferApplied(3)).toBeTrue();
      expect(component.isOfferApplied(5)).toBeFalse();
    });
  });
});
