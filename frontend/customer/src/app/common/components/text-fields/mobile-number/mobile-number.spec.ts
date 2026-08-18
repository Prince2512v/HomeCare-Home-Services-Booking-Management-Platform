import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileNumber } from './mobile-number';

describe('MobileNumber', () => {
  let component: MobileNumber;
  let fixture: ComponentFixture<MobileNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
