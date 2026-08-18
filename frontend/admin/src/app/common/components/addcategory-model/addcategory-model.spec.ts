import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcategoryModel } from './addcategory-model';

describe('AddcategoryModel', () => {
  let component: AddcategoryModel;
  let fixture: ComponentFixture<AddcategoryModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddcategoryModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddcategoryModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
