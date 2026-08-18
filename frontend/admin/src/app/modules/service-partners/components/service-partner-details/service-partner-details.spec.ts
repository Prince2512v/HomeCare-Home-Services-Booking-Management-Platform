import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicePartnerDetail } from './service-partner-details.js';

describe('ServicePartnerDetail', () => {
  let component: ServicePartnerDetail;
  let fixture: ComponentFixture<ServicePartnerDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicePartnerDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicePartnerDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});