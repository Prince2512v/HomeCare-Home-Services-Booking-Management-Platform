import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTransactions } from './payment-transaction';

describe('PaymentTransaction', () => {
  let component: PaymentTransactions;
  let fixture: ComponentFixture<PaymentTransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentTransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentTransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
