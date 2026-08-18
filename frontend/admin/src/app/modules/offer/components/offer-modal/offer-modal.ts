import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { Button, ButtonInputConfig, Description, DescriptionFieldConfig, Name, NameFieldConfig, NumberInput, NumberInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { GetOfferResponseModel, CreateOfferRequestModel, UpdateOfferRequestModel } from '@offerModels';
import { OfferService } from '@offerServices';

@Component({
  selector: 'app-offer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button, Name, Description, NumberInput],
  templateUrl: './offer-modal.html',
  styleUrl: './offer-modal.css',
})
export class OfferModal implements OnInit {

  @Input() offer: GetOfferResponseModel | null = null;

  @Output() modalClose = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateOfferRequestModel | UpdateOfferRequestModel>();

  offerForm!: FormGroup;
  isLoadingOffer = false;

  couponCodeConfig: NameFieldConfig = {
    label: 'Coupon Code',
    placeholder: 'Coupon Code',
    formControlName: 'couponCode',
  };

  couponDescriptionConfig: DescriptionFieldConfig = {
    label: 'Coupon Description',
    placeholder: 'Coupon Description',
    formControlName: 'couponDescription',
  };

  offerConfig: NumberInputConfig = {
    formControlName: 'discountPercentage',
    placeholder: 'Coupen Discount',
    suffix: '%',
    min: 1,
    max: 99,
  };

  cancelConfig: ButtonInputConfig = {
    variant: 'close',
    text: 'Cancel',
    onClick: () => this.closeModal(),
  };

  saveConfig: ButtonInputConfig = {
    variant: 'save',
    text: 'Save',
    onClick: () => this.handleSave(),
  };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private offerService: OfferService,
  ) {}

  get f() {
    return this.offerForm.controls;
  }

  ngOnInit(): void {
    this.offerForm = this.fb.group({
      couponCode:          ['', [Validators.required, AppValidators.noWhitespace]],
      couponDescription:   ['', [Validators.required, AppValidators.noWhitespace]],
      discountPercentage:  [null, [Validators.required, Validators.min(1), Validators.max(99.99)]],
      isActive:            [true],
    });

    if (this.offer) {
      this.loadOfferById(this.offer.id);
    }
  }

  private loadOfferById(id: number): void {
    this.isLoadingOffer = true;
    this.offerForm.disable();

    this.offerService
      .getOfferById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.offerForm.setValue({
              couponCode:         res.data.couponCode         || '',
              couponDescription:  res.data.couponDescription  || '',
              discountPercentage: res.data.discountPercentage ?? null,
              isActive:           res.data.isActive,
            });
          }
          this.offerForm.enable();
          this.isLoadingOffer = false;
        },
        error: () => {
          this.toastr.error('Failed to load offer details');
          this.isLoadingOffer = false;
          this.modalClose.emit();
        },
      });
  }

  handleSave(): void {
    this.offerForm.markAllAsTouched();

    if (this.offerForm.invalid) {
      if (this.f['couponCode']?.errors?.['whitespace']) {
        this.toastr.warning('Coupon code cannot be empty or spaces only');
      } else if (this.f['couponDescription']?.errors?.['whitespace']) {
        this.toastr.warning('Description cannot be empty or spaces only');
      } else if (this.f['discountPercentage']?.errors) {
        this.toastr.warning('Discount must be between 1 and 99.99');
      } else {
        this.toastr.warning('Please fill all required fields');
      }
      return;
    }

    if (this.isEditMode && this.offer?.id) {

      const updateData: UpdateOfferRequestModel = {
        id:                 this.offer.id,
        couponCode:         this.f['couponCode']?.value?.toUpperCase().trim(),
        couponDescription:  this.f['couponDescription']?.value?.trim(),
        discountPercentage: this.f['discountPercentage']?.value,
        isActive:           this.f['isActive']?.value,
      };
      this.save.emit(updateData);
    } else {
      const createData: CreateOfferRequestModel = {
        couponCode:         this.f['couponCode']?.value?.toUpperCase().trim(),
        couponDescription:  this.f['couponDescription']?.value?.trim(),
        discountPercentage: this.f['discountPercentage']?.value,
        isActive:           this.f['isActive']?.value,
      };
      this.save.emit(createData);
    }
  }

  closeModal(): void {
    this.offerForm.reset();
    this.modalClose.emit();
  }

  get isEditMode(): boolean {
    return !!this.offer;
  }
}