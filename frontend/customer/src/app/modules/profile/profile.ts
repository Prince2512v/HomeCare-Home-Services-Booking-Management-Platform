import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import type { UserProfile, Address } from '@profile';
import {
  AddAddressModal,
  DeleteModal,
  createDeleteConfig,
  type DeleteModalConfig,
} from '@common';
import { AuthService } from '@auth';
import { ProfileService } from '@profileservices';
import { ChangeEmailModal } from './components/change-email-modal/change-email-modal';
import { ChangeMobileModal } from './components/change-mobile-modal/change-mobile-modal';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ChangeMobileModal, ChangeEmailModal, AddAddressModal, DeleteModal],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  profile: UserProfile | null = null;
  addresses: Address[] = [];
  isLoadingProfile = false;
  isLoadingAddresses = false;
  showMobileModal = false;
  showEmailModal = false;
  showAddressModal = false;
  showAllAddresses = false;
  showDeleteModal = false;
  selectedAddress: Address | null = null;
  deleteModalConfig: DeleteModalConfig = createDeleteConfig('this address');
  private addressIdToDelete: string | null = null;

  ngOnInit(): void {
    this.prefillFromCurrentUser();
    this.loadProfile();
    this.loadAddresses();
  }

  private prefillFromCurrentUser(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.profile = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      mobileNumber: null as any,
      isEmailVerified: currentUser.isEmailVerified,
      createdAt: currentUser.createdAt,
    };
  }

  loadProfile(): void {
    this.isLoadingProfile = true;
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.profile = response.data;
        this.isLoadingProfile = false;
      },
      error: () => {
        this.isLoadingProfile = false;
      },
    });
  }

  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.profileService.getAddresses().subscribe({
      next: (response) => {
        this.addresses = response.data.records;
        this.isLoadingAddresses = false;
      },
      error: () => {
        this.isLoadingAddresses = false;
      },
    });
  }

  openChangeMobile(): void {
    this.showMobileModal = true;
  }
  openChangeEmail(): void {
    this.showEmailModal = true;
  }
  openAddAddress(): void {
    this.selectedAddress = null;
    this.showAddressModal = true;
  }
  openEditAddress(address: Address): void {
    this.selectedAddress = address;
    this.showAddressModal = true;
  }

  confirmDeleteAddress(addressId: string): void {
    this.addressIdToDelete = addressId;
    this.deleteModalConfig = createDeleteConfig('this address');
    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    if (!this.addressIdToDelete) return;
    this.profileService.deleteAddress(this.addressIdToDelete).subscribe({
      next: () => {
        this.loadAddresses();
        this.toastr.success('Address deleted');
        this.showDeleteModal = false;
        this.addressIdToDelete = null;
      },
      error: () => {
        this.toastr.error('Failed to delete address');
        this.showDeleteModal = false;
        this.addressIdToDelete = null;
      },
    });
  }

  onMobileSaved(mobile: string): void {
    if (this.profile) this.profile.mobileNumber = mobile;
    this.showMobileModal = false;
    this.toastr.success('Mobile number updated successfully');
  }

  onEmailSaved(email: string): void {
    if (this.profile) this.profile.email = email;
    this.showEmailModal = false;
    this.toastr.success('Email updated successfully');
  }

  onAddressSaved(action: string): void {
    this.showAddressModal = false;
    this.loadAddresses();
    this.toastr.success(action === 'updated' ? 'Address updated successfully' : 'Address added successfully');
  }
}