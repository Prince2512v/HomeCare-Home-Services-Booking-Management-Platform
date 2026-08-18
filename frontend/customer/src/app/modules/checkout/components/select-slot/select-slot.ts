import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookSlotModal } from '@checkout';
import { Button, ButtonInputConfig } from '@common';
import { SlotSelection } from '../../Models/checkout.models.js';

@Component({
  selector: 'app-select-slot',
  imports: [CommonModule, BookSlotModal, Button],
  templateUrl: './select-slot.html',
  styleUrl: './select-slot.css',
})
export class SelectSlot implements OnInit {
  @Input() isAddressDone = false;
  @Input() serviceId: number | null = null;
  @Input() serviceTypeId: number | null = null;

  @Output() slotSaved = new EventEmitter<SlotSelection>();
  @Output() partnerAvailableChange = new EventEmitter<boolean>();

  selectedSlot: SlotSelection | null = null;
  showModal = false;

  editConfig!: ButtonInputConfig;
  bookConfig!: ButtonInputConfig;

  ngOnInit(): void {
    this.editConfig = {
      text: 'Edit',
      cssClass: 'rounded-pill fw-semibold ss-btn-edit',
      onClick: () => this.openModal(),
    };

    this.bookConfig = {
      text: 'Book Slot',
      cssClass: 'rounded-pill fw-semibold text-white px-4 py-2 ss-btn-book',
      onClick: () => this.openModal(),
    };
  }

  openModal(): void {
    if (!this.isAddressDone) return;
    this.showModal = true;
  }

  onSaved(slot: SlotSelection): void {
    this.selectedSlot = slot;
    this.showModal = false;
    this.slotSaved.emit(slot);
    this.partnerAvailableChange.emit(true);
  }

  onModalClose(): void {
    this.showModal = false;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  formatTime(time24: string): string {
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${String(minutes).padStart(2, '0')} ${meridiem}`;
  }
}