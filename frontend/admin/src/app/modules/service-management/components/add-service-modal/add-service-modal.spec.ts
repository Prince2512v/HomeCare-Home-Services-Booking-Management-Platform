import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddServiceModal } from './add-service-modal';

describe('AddServiceModal', () => {
  let component: AddServiceModal;
  let fixture: ComponentFixture<AddServiceModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddServiceModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddServiceModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
