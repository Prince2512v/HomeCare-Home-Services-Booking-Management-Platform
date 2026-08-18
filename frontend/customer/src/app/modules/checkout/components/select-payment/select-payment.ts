import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonModal } from '@common';
import { PAYMENT_METHODS } from '@constants';

@Component({
  selector: 'app-select-payment',
  imports: [CommonModule, CommonModal],
  templateUrl: './select-payment.html',
  styleUrl: './select-payment.css',
})
export class SelectPayment {
  @Input() isSlotDone = false;
  @Output() paymentSaved = new EventEmitter<string>();

  readonly methods: string[] = [PAYMENT_METHODS.CARD, PAYMENT_METHODS.CASH];

  selectedMethod: string | null = null;
  pendingMethod: string | null = null;
  showModal = false;

  get canSave(): boolean {
    return !!this.pendingMethod;
  }

  openModal(): void {
    if (!this.isSlotDone) return;
    this.showModal = true;
  }

  selectMethod(method: string): void {
    this.pendingMethod = method;
  }

  isSelected(method: string): boolean {
    return this.pendingMethod === method;
  }

  save(): void {
    if (!this.pendingMethod) return;
    this.selectedMethod = this.pendingMethod;
    this.showModal = false;
    this.paymentSaved.emit(this.selectedMethod);
  }
}