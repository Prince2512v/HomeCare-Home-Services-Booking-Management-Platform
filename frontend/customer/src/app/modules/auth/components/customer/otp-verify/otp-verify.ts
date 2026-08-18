import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ROUTES } from '@constants';
import { AuthService } from '@auth';

@Component({
  selector: 'app-otp-verify',
  imports: [CommonModule],
  templateUrl: './otp-verify.html',
  styleUrl: './otp-verify.css',
})
export class OtpVerify {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  otp = '';
  errorMessage = '';
  isLoading = false;
  isResending = false;

  email = sessionStorage.getItem('email') ?? 'your registered email';
  name = sessionStorage.getItem('name') ?? '';

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.otp = input.value.replace(/[^0-9]/g, '').slice(0, 4);
    input.value = this.otp;
    this.errorMessage = '';
  }

  verifyOtp(): void {
    this.errorMessage = '';

    if (this.otp.length !== 4) {
      this.errorMessage = 'Please enter a 4 digit OTP';
      return;
    }

    this.isLoading = true;

    this.authService
      .verifyOtp({ email: this.email, otp: this.otp, name: this.name })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Signed in successfully!');
          this.router.navigate([ROUTES.CUSTOMER.HOME.HOME_ABSOLUTE]);
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
    if (!this.email || this.email === 'your registered email') {
      this.errorMessage = 'Email not found. Please go back and sign in again.';
      return;
    }

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
