import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Email, Password, MobileNumber, Address, ButtonInputConfig, Button } from '@common';
import { AppValidators } from '@Validators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@authservices';
import { AdminProfileService } from '../../services';
import { AdminProfileModel } from '../../models';
import { MobileNumberPipe } from '@pipe';

@Component({
  selector: 'app-admin-profile',
  imports: [CommonModule, ReactiveFormsModule, Email, Password, MobileNumber, Address, Button, MobileNumberPipe],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
})
export class AdminProfile implements OnInit {
  emailConfig!: any;
  currentPasswordConfig!: any;
  newPasswordConfig!: any;
  confirmPasswordConfig!: any;
  mobileNumberConfig!: any;
  addressConfig!: any;
  cancelContactConfig!: ButtonInputConfig;
  saveContactConfig!: ButtonInputConfig;
  cancelPasswordConfig!: ButtonInputConfig;
  savePasswordConfig!: ButtonInputConfig;

  profile: AdminProfileModel | null = null;

  contactForm!: FormGroup;
  passwordForm!: FormGroup;

  isContactLoading = false;
  isPasswordLoading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: AdminProfileService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setFormInputConfig();
    this.loadAdminDetails();
    this.resetFormsOnClickingOverlay();
    this.initButtonConfigs();
  }

  private loadAdminDetails() {
    this.profileService.profile$.subscribe((profile) => {
      if (!profile) return;
      this.profile = profile;
      this.contactForm.patchValue({
        email: profile.email,
        mobileNumber: profile.mobileNumber,
        address: profile.address?.trim().replace(/\s+/g, ' ') ?? '',
      });
    });
  }

  private initButtonConfigs(): void {
    this.cancelContactConfig = {
      variant: 'close',
      text: 'Cancel',
      cssClass: 'btn fw-semibold px-4 py-2 rounded-3 w-100 btn-cancel-custom',
      onClick: () => this.resetContactForm(),
    };
    this.saveContactConfig = {
      variant: 'save',
      text: 'Save',
      cssClass: 'btn fw-semibold px-4 py-2 rounded-3 w-100 btn-save-custom',
      onClick: () => this.saveContact(),
    };
    this.cancelPasswordConfig = {
      variant: 'close',
      text: 'Cancel',
      cssClass: 'btn fw-semibold px-4 py-2 rounded-3 w-100 btn-cancel-custom',
      onClick: () => this.resetPasswordForm(),
    };
    this.savePasswordConfig = {
      variant: 'save',
      text: 'Save',
      cssClass: 'btn fw-semibold px-4 py-2 rounded-3 w-100 btn-save-custom',
      onClick: () => this.savePassword(),
    };
  }

  resetContactForm(): void {
    if (!this.profile) return;
    this.contactForm.patchValue({
      email: this.profile.email,
      mobileNumber: this.profile.mobileNumber,
      address: this.profile.address?.trim().replace(/\s+/g, ' ') ?? '',
    });
    this.contactForm.markAsUntouched();
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.passwordForm.markAsUntouched();
  }

  resetFormsOnClickingOverlay() {
    document.getElementById('changePasswordModal')?.addEventListener('hidden.bs.modal', () => {
      this.resetPasswordForm();
    });

    document.getElementById('editContactModal')?.addEventListener('hidden.bs.modal', () => {
      this.resetContactForm();
    });
  }

  private initializeForms(): void {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, AppValidators.noWhitespace, AppValidators.email]],
      mobileNumber: ['', [Validators.required, AppValidators.noWhitespace, AppValidators.phone]],
      address: ['', [Validators.required, AppValidators.noWhitespace, AppValidators.address]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, AppValidators.password]],
        newPassword: ['', [Validators.required, AppValidators.password]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [
          AppValidators.matchPasswords('newPassword', 'confirmPassword'),
          AppValidators.sameAsCurrentPassword('currentPassword', 'newPassword'),
        ],
      }
    );
  }

  private setFormInputConfig(): void {
    this.emailConfig = { formControlName: 'email', placeholder: 'Email', floating: true };
    this.currentPasswordConfig = {
      formControlName: 'currentPassword',
      placeholder: 'Current Password',
      floating: true,
    };
    this.newPasswordConfig = {
      formControlName: 'newPassword',
      placeholder: 'New Password',
      floating: true,
    };
    this.confirmPasswordConfig = {
      formControlName: 'confirmPassword',
      placeholder: 'Confirm Password',
      floating: true,
    };
    this.mobileNumberConfig = {
      formControlName: 'mobileNumber',
      placeholder: 'Mobile Number',
      floating: true,
    };
    this.addressConfig = { formControlName: 'address', placeholder: 'Address', floating: true };
  }

  onProfileImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(extension)) {
      this.toastr.error('Only image files are allowed (JPG, PNG, WEBP, SVG)');
      event.target.value = '';
      return;
    }

    const maxSizeInMB = 5;
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeInMB) {
      this.toastr.error('Image size must not exceed 5MB');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profileService.pushImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    this.profileService.updateProfileImage(file).subscribe({
      next: (res) => this.toastr.success(res.message),
      error: (err) => this.toastr.error(err?.error?.message),
    });
  }

  saveContact(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { email, mobileNumber } = this.contactForm.value;
    const address = (this.contactForm.value.address as string).trim().replace(/\s+/g, ' ');

    const hasChanged =
      email !== this.profile?.email ||
      mobileNumber !== this.profile?.mobileNumber ||
      address !== this.profile?.address;
    if (!hasChanged) return;

    this.isContactLoading = true;

    this.profileService.updateContact({ email, mobileNumber, address }).subscribe({
      next: (res) => {
        this.isContactLoading = false;
        this.toastr.success(res.message);
      },
      error: (err) => {
        this.isContactLoading = false;
        this.toastr.error(err?.error?.message);
      },
    });
  }

  savePassword(): void {
    if (!this.isPasswordFormReady) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isPasswordLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.profileService.updatePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.isPasswordLoading = false;
        this.toastr.success(res.message);
        this.passwordForm.reset();
        this.authService.logout();
      },
      error: (err) => {
        this.isPasswordLoading = false;
        this.toastr.error(err?.error?.message || 'Current Password is incorrect');
      },
    });
  }

  get isPasswordFormReady(): boolean {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (!currentPassword || !newPassword || !confirmPassword) return false;
    if (currentPassword === newPassword) return false;
    if (newPassword !== confirmPassword) return false;
    return this.passwordForm.valid;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/admin/profile-image.svg';
  }
}