import {Component,Input,Output,EventEmitter,OnChanges,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { ToastrService } from 'ngx-toastr';
import { Button, ButtonInputConfig } from '@common';
import { CheckoutResx, SlotAvailabilityResponse } from '../../Models/checkout.models';

@Component({
  selector: 'app-select-time',
  imports: [CommonModule, Button],
  templateUrl: './select-time.html',
  styleUrl: './select-time.css',
})
export class SelectTime implements OnChanges {
  @Input() selectedDate: string | null = null;
  @Input() serviceId: number | null = null;
  @Input() serviceTypeId: number | null = null;

  @Output() timeSelected = new EventEmitter<string>();
  @Output() availabilityChecked = new EventEmitter<boolean>();

  private api = inject(ApiService);
  private toastr = inject(ToastrService);

  readonly resx = CheckoutResx;
  readonly timeSlots = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];

  selectedTime: string | null = null;
  checkingSlot = false;

  getTimeBtnConfig(slot: string): ButtonInputConfig {
    const isDisabled = this.isPast(slot) || this.checkingSlot;

    return {
      text: slot,
      cssClass: `
        st-time-pill
        ${this.isSelected(slot) ? 'st-time-pill--active' : ''}
        ${isDisabled ? 'st-time-pill--disabled' : ''}
      `,
      disabled: isDisabled,
      onClick: () => this.selectTime(slot),
    };
  }

  ngOnChanges(): void {
    if (this.selectedTime && this.isPast(this.selectedTime)) {
      this.selectedTime = null;
      this.availabilityChecked.emit(false);
    }
  }

  private isToday(): boolean {
    if (!this.selectedDate) return false;
    const today = new Date();
    const selected = new Date(this.selectedDate);
    return (
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate()
    );
  }

  isPast(slot: string): boolean {
    if (!this.isToday()) return false;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return this.parseSlotMinutes(slot) <= nowMinutes;
  }

  private parseSlotMinutes(slot: string): number {
    const [timePart, meridiem] = slot.split(' ');
    const [hoursStr, minutesStr] = timePart.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  selectTime(slot: string): void {
    if (this.isPast(slot) || this.checkingSlot) return;

    this.selectedTime = slot;
    this.timeSelected.emit(slot);

    if (!this.selectedDate || !this.serviceId || !this.serviceTypeId) return;

    this.checkingSlot = true;
    this.availabilityChecked.emit(false);

    const params: Record<string, string> = {
      ServiceId: String(this.serviceId),
      ServiceTypeId: String(this.serviceTypeId),
      BookingDate: this.selectedDate,
      BookingTime: this.formatTo24Hour(slot),
    };

    this.api
      .get<SlotAvailabilityResponse>(
        API_ROUTES.BOOKING.SLOT_AVAILABILITY,
        params,
      )
      .subscribe({
        next: (response) => {
          this.checkingSlot = false;
          const result = response.data;

          if (result.isAvailable) {
            this.availabilityChecked.emit(true);
          } else {
            this.availabilityChecked.emit(false);
            this.toastr.warning(
              'No service partner is available for this slot. Please choose a different time or date.',
              'Slot Unavailable',
            );
          }
        },
        error: () => {
          this.checkingSlot = false;
          this.availabilityChecked.emit(false);
          this.toastr.error(
            'Failed to check slot availability. Please try again.',
            'Error',
          );
        },
      });
  }

  isSelected(slot: string): boolean {
    return this.selectedTime === slot;
  }

  private formatTo24Hour(slot: string): string {
    const [time, meridiem] = slot.split(' ');
    let hours = Number(time.split(':')[0]);
    const minutes = Number(time.split(':')[1]);

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}
