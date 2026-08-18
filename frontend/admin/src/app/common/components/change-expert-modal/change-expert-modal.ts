import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { BookingService } from 'src/app/modules/booking-management/services/booking.service';
import { AvailableExpertResponse, ChangeExpertRequestModel } from 'src/app/modules/booking-management/models';
import { Button, ButtonInputConfig } from '@common';

@Component({
  selector: 'app-change-expert-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './change-expert-modal.html',
  styleUrl: './change-expert-modal.css',
})
export class ChangeExpertModal implements OnInit, OnChanges {
  @Input() bookingId!: number;
  @Input() serviceType!: string;
  @Input() serviceTypeId!: number;
  @Input() currentExpertName: string | null = null;
  @Input() currentExpertImageUrl: string | null = null;

  @Output() modalClose = new EventEmitter<void>();
  @Output() expertChanged = new EventEmitter<any>();

  availableExperts: AvailableExpertResponse[] = [];
  selectedPartnerId: number | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  cancelBtnConfig!: ButtonInputConfig;
  changeBtnConfig!: ButtonInputConfig;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.initButtonConfigs();
    this.loadExperts();
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      variant: 'close',
      text: 'Cancel',
      onClick: () => this.close(),
    };

    this.changeBtnConfig = {
      variant: 'save',
      text: 'Change',
      onClick: () => this.onChange(),
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceTypeId'] && !changes['serviceTypeId'].firstChange) {
      this.loadExperts();
    }
  }

  loadExperts(): void {
    if (!this.serviceTypeId) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedPartnerId = null;

    this.bookingService.getAvailableExperts(this.serviceTypeId, this.bookingId).subscribe({
      next: (res) => {
        this.availableExperts = res.data.map((e) => ({
          ...e,
          profileImageUrl: e.profileImageUrl
            ? `${environment.resourceUrl}/resources/ServicePartner/${e.profileImageUrl}`
            : null,
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message;
        this.isLoading = false;
      },
    });
  }

  selectExpert(partnerId: number): void {
    this.selectedPartnerId = partnerId;
  }

  onChange(): void {
    if (!this.selectedPartnerId) return;
    const request: ChangeExpertRequestModel = {
      bookingId: this.bookingId,
      newPartnerId: this.selectedPartnerId,
    };
    this.isSaving = true;
    this.bookingService.changeExpert(request).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.expertChanged.emit(res);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message;
        this.isSaving = false;
      },
    });
  }

  close(): void {
    this.modalClose.emit();
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const wrap = img.closest('.expert-avatar-wrap');
    if (wrap) {
      img.style.display = 'none';
      const placeholder = wrap.querySelector('.avatar-placeholder') as HTMLElement;
      if (placeholder) placeholder.style.display = 'flex';
    }
  }
}
