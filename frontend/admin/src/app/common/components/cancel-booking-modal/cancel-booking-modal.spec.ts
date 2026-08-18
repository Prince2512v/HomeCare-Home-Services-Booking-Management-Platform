import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelBookingModal } from './cancel-booking-modal';

describe('CancelBookingModal', () => {
  let component: CancelBookingModal;
  let fixture: ComponentFixture<CancelBookingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelBookingModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelBookingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
