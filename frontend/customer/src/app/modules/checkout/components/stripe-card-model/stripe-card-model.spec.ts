import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeCardModal } from './stripe-card-model';

describe('StripeCardModel', () => {
  let component: StripeCardModal;
  let fixture: ComponentFixture<StripeCardModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeCardModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeCardModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
