import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteModel } from './delete-model';

describe('DeleteModel', () => {
  let component: DeleteModel;
  let fixture: ComponentFixture<DeleteModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
