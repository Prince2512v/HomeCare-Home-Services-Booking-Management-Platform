import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Servicelisting } from './servicelisting';

describe('Servicelisting', () => {
  let component: Servicelisting;
  let fixture: ComponentFixture<Servicelisting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicelisting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Servicelisting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
