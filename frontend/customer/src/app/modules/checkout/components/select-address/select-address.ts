import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Address } from '@profile';
import { SelectAddressModal } from '@common';
import { AuthService } from '@auth';
@Component({
  selector: 'app-select-address',
  imports: [CommonModule, SelectAddressModal],
  templateUrl: './select-address.html',
  styleUrl: './select-address.css',
})
export class SelectAddress {
  private authService = inject(AuthService);

  @Output() addressSelected = new EventEmitter<Address>();

  selectedAddress: Address | null = null;
  showModal = false;

  get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  openModal(): void {
    if (!this.isLoggedIn) return;
    this.showModal = true;
  }

  onAddressSelected(address: Address): void {
    this.selectedAddress = address;
    this.showModal = false;
    this.addressSelected.emit(address);
  }

  formatDisplayAddress(address: Address): string {
    return [address.houseFlatNumber, address.landmark]
      .filter(Boolean)
      .join(', ');
  }
}