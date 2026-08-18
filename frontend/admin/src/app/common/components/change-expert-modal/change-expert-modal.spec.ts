import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeExpertModal } from './change-expert-modal';

describe('ChangeExpertModal', () => {
  let component: ChangeExpertModal;
  let fixture: ComponentFixture<ChangeExpertModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeExpertModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeExpertModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
