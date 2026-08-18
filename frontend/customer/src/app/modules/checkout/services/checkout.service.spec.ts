import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { CheckoutService } from './checkout.service';
import { environment } from '../../../../environments/environment';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let http: HttpTestingController;
  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutService],
    });
    service = TestBed.inject(CheckoutService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getActiveOffers should GET offer base route', () => {
    service.getActiveOffers().subscribe((res) => {
      expect((res as any).data.length).toBe(1);
    });
    const req = http.expectOne(`${API}/offers`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: [{ id: 1, couponCode: 'FIRST10', discountPercentage: 10 }],
    });
  });

  it('getCheckoutSummary should GET with serviceId in URL', () => {
    service.getCheckoutSummary(5).subscribe((res) => {
      expect((res as any).data.totalAmount).toBe(90);
    });
    const req = http.expectOne(`${API}/offers/checkout-summary/5`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        itemsTotal: 100,
        taxAmount: 5,
        discountAmount: 15,
        totalAmount: 90,
      },
    });
  });

  it('validateCoupon should POST with request body', () => {
    const payload = { serviceId: 5, offerId: 2 };
    service.validateCoupon(payload).subscribe((res) => {
      expect((res as any).data.discountAmount).toBe(10);
    });
    const req = http.expectOne(`${API}/offers/validate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ data: { discountAmount: 10, totalAmount: 90 } });
  });

  it('validateCoupon should propagate error response', () => {
    let errorRes: any;
    service.validateCoupon({ serviceId: 1, offerId: 99 }).subscribe({
      error: (err) => (errorRes = err),
    });
    const req = http.expectOne(`${API}/offers/validate`);
    req.flush(
      { message: 'Coupon Code not found.' },
      { status: 404, statusText: 'Not Found' },
    );
    expect(errorRes.status).toBe(404);
  });
});
