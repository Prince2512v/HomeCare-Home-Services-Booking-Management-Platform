import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInModal, OtpModal } from '@common';
import { AuthService } from '@auth';

type AuthStep = 'idle' | 'sign-in' | 'otp';

@Component({
  selector: 'app-booking-for',
  imports: [CommonModule, SignInModal, OtpModal],
  templateUrl: './booking-for.html',
  styleUrl: './booking-for.css',
})
export class BookingFor {
  authService = inject(AuthService);

  authStep: AuthStep = 'idle';
  pendingEmail = '';
  pendingName = '';

  get currentUser() {
    return this.authService.currentUser();
  }

  openSignIn(): void {
    this.authStep = 'sign-in';
  }

  onOtpSent(payload: { email: string; name: string }): void {
    this.pendingEmail = payload.email;
    this.pendingName = payload.name;
    this.authStep = 'otp';
  }

  onVerified(): void {
    this.authStep = 'idle';
  }

  closeModal(): void {
    this.authStep = 'idle';
  }
}