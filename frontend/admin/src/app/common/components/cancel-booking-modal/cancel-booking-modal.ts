import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from 'src/app/modules/booking-management/services/booking.service';
import { CancelBookingRequestModel } from 'src/app/modules/booking-management/models';
import { Button, ButtonInputConfig, Description, DescriptionFieldConfig } from '@common';

@Component({
  selector: 'app-cancel-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Description, Button],
  templateUrl: './cancel-booking-modal.html',
  styleUrl: './cancel-booking-modal.css',
})
export class CancelBookingModal implements OnInit {
  @Input() bookingId!: number;

  @Output() modalClose = new EventEmitter<void>();
  @Output() bookingCancelled = new EventEmitter<any>();

  cancelForm!: FormGroup;
  reasonConfig!: DescriptionFieldConfig;

  cancelConfig!: ButtonInputConfig;
  saveConfig!: ButtonInputConfig;

  reason = '';
  isSaving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
    this.initConfigs();
    this.initButtonConfigs();
  }

  private initForm(): void {
    this.cancelForm = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  private initConfigs(): void {
    this.reasonConfig = {
      formControlName: 'reason',
      placeholder: 'Type Here',
      rows: 3,
    };
  }

  private initButtonConfigs(): void {
    this.cancelConfig = {
      variant: 'close',
      text: 'Cancel',
      onClick: () => this.close(),
    };

    this.saveConfig = {
      variant: 'save',
      text: 'Save',
      onClick: () => this.onSave(),
    };
  }

  constructor(private bookingService: BookingService, private fb: FormBuilder) {}

  onSave(): void {
    this.cancelForm.markAllAsTouched();

    if (this.cancelForm.invalid) {
      return;
    }

    const request: CancelBookingRequestModel = {
      bookingId: this.bookingId,
      reason: this.cancelForm.value.reason.trim(),
    };

    this.errorMessage = '';

    this.bookingService.cancelBooking(request).subscribe({
      next: (res: any) => {
        this.bookingCancelled.emit(res);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message;
      },
    });
  }

  close(): void {
    this.modalClose.emit();
  }
}
