import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import type { Address, AddressListResponse } from '@profile';
import { ApiResponse } from '@models';
import { CommonModal } from '@common';
import { ProfileService } from '@profileservices';
import { AddAddressModal } from '../add-address-modal/add-address-modal';

@Component({
  selector: 'app-select-address-modal',
  imports: [CommonModule, CommonModal, AddAddressModal],
  templateUrl: './select-address-modal.html',
  styleUrl: './select-address-modal.css',
})
export class SelectAddressModal implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() selected = new EventEmitter<Address>();

  private profileService = inject(ProfileService);
  private toastr = inject(ToastrService);

  addresses: Address[] = [];
  isLoading = false;
  showAddAddressModal = false;
  selectedId: string | null = null;

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.isLoading = true;
    this.profileService.getAddresses().subscribe({
      next: (res: ApiResponse<AddressListResponse>) => {
        this.addresses = res.data.records;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load addresses.');
      },
    });
  }

  openAddAddress(): void {
    this.showAddAddressModal = true;
  }

  onAddressSaved(): void {
    this.showAddAddressModal = false;
    this.loadAddresses();
    this.toastr.success('Address saved successfully.');
  }

  selectAddress(address: Address): void {
    this.selectedId = address.addressId;
    setTimeout(() => this.selected.emit(address), 150);
  }

  getAddressLabel(address: Address): string {
    return address.saveAs || 'Address';
  }
}