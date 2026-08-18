import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDetail } from './service-details';

describe('ServiceDetails', () => {
  let component: ServiceDetail;
  let fixture: ComponentFixture<ServiceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
