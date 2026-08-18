import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CommonModal } from '@common';
import { AuthService } from '@auth';

@Component({
  selector: 'app-otp-modal',
  imports: [CommonModule, CommonModal],
  templateUrl: './otp-modal.html',
  styleUrl: './otp-modal.css',
})
export class OtpModal {
  @Input() email = '';
  @Input() name = '';
  @Output() close = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();

  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  otp = '';
  errorMessage = '';
  isLoading = false;
  isResending = false;

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.otp = input.value.replace(/[^0-9]/g, '').slice(0, 4);
    input.value = this.otp;
    this.errorMessage = '';
  }

  verifyOtp(): void {
    this.errorMessage = '';
    if (this.otp.length !== 4) {
      this.errorMessage = 'Please enter a 4 digit OTP.';
      return;
    }

    this.isLoading = true;
    this.authService
      .verifyOtp({ email: this.email, otp: this.otp, name: this.name })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Signed in successfully!');
          this.verified.emit();
        },
        error: (err: any) => {
          this.isLoading = false;
          const msg = err?.error?.message;
          this.errorMessage = msg;
          this.toastr.error(msg);
        },
      });
  }

  resendOtp(): void {
    if (!this.email) return;
    this.isResending = true;
    this.otp = '';
    this.errorMessage = '';

    this.authService.sendOtp({ email: this.email }).subscribe({
      next: () => {
        this.isResending = false;
        this.toastr.success('OTP resent successfully!');
      },
      error: (err: any) => {
        this.isResending = false;
        const msg = err?.error?.message;
        this.errorMessage = msg;
        this.toastr.error(msg);
      },
    });
  }
}
