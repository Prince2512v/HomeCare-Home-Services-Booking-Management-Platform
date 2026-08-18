import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeMobileModal } from './change-mobile-modal';

describe('ChangeMobileModal', () => {
  let component: ChangeMobileModal;
  let fixture: ComponentFixture<ChangeMobileModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeMobileModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeMobileModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});