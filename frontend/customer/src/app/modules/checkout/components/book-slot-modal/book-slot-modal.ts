import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonModal, Button, ButtonInputConfig } from '@common';
import { CheckoutResx,SlotSelection} from '../../Models/checkout.models';
import { SelectDate } from '../select-date/select-date';
import { SelectTime } from '../select-time/select-time';

@Component({
  selector: 'app-book-slot-modal',
  imports: [CommonModule, CommonModal, SelectDate, SelectTime, Button],
  templateUrl: './book-slot-modal.html',
  styleUrl: './book-slot-modal.css',
})
export class BookSlotModal implements OnInit {
  @Input() initialDate: string | null = null;
  @Input() initialTime: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<SlotSelection>();
  @Input() serviceId: number | null = null;
  @Input() serviceTypeId: number | null = null;

  readonly resx = CheckoutResx;
  isPartnerAvailable = false;

  pendingDate: string | null = null;
  pendingTime: string | null = null;
  pendingTime24: string | null = null;

  cancelBtnConfig!: ButtonInputConfig;

  get saveBtnConfig(): ButtonInputConfig {
    return {
      text: 'Save',
      cssClass:
        'btn rounded-pill px-4 py-2 fw-semibold text-white bsm-btn-save',
      disabled: !this.canSave,
      onClick: () => this.save(),
    };
  }

  ngOnInit(): void {
    this.initConfig();
  }

  private initConfig(): void {
    this.cancelBtnConfig = {
      text: 'Cancel',
      cssClass: 'bsm-btn-cancel',
      onClick: () => this.close.emit(),
    };
  }

  onDateSelected(date: string): void {
    this.pendingDate = date;
    this.pendingTime = null;
    this.isPartnerAvailable = false;
  }

  onTimeSelected(time: string): void {
    this.pendingTime = time;
    this.pendingTime24 = this.formatTo24Hour(time);
    this.isPartnerAvailable = false;
  }

  get canSave(): boolean {
    return (
      !!(this.pendingDate ?? this.initialDate) &&
      !!this.pendingTime &&
      this.isPartnerAvailable
    );
  }

  onAvailabilityChecked(available: boolean): void {
    this.isPartnerAvailable = available;
  }

  save(): void {
    const date = this.pendingDate ?? this.initialDate;
    if (!date || !this.pendingTime24) return;
    this.saved.emit({ bookingDate: date, bookingTime: this.pendingTime24 });
  }

  private formatTo24Hour(slot: string): string {
    const [timePart, meridiem] = slot.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}