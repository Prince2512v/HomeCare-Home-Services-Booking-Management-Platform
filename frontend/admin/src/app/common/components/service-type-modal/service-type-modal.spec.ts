import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTypeModal } from './service-type-modal';

describe('ServiceTypeModal', () => {
  let component: ServiceTypeModal;
  let fixture: ComponentFixture<ServiceTypeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceTypeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceTypeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
