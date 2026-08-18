import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModal, Email, EmailInputConfig, Button, ButtonInputConfig } from '@common';
import { ProfileService } from '@profileservices';
import { AuthService } from '@auth';
import { AppValidators } from '@Validators';

@Component({
  selector: 'app-change-email-modal',
  imports: [CommonModule, ReactiveFormsModule, CommonModal, Email, Button],
  templateUrl: './change-email-modal.html',
  styleUrl: './change-email-modal.css',
})
export class ChangeEmailModal implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  @Input() currentEmail = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  step = 1;
  isLoading = false;

  emailForm!: FormGroup;
  otpForm!: FormGroup;
  emailConfig!: EmailInputConfig;

  get sendOtpBtnConfig(): ButtonInputConfig {
    return {
      text: 'Get OTP',
      cssClass: 'btn-save',
      isLoading: this.isLoading,
      disabled: this.isLoading,
      onClick: () => this.sendOtp(),
    };
  }

  get verifyBtnConfig(): ButtonInputConfig {
    return {
      text: 'Verify',
      cssClass: 'btn-save',
      isLoading: this.isLoading,
      disabled: this.isLoading,
      onClick: () => this.verifyAndSave(),
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setFormInputConfig();
  }

  private initializeForm(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, AppValidators.email]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required]],
    });
  }

  private setFormInputConfig(): void {
    this.emailConfig = {
      formControlName: 'email',
      placeholder: 'New Email',
      floating: true,
    };
  }

  get newEmail(): string {
    return this.emailForm.value.email ?? '';
  }

  get isOtpInvalid(): boolean {
    const ctrl = this.otpForm.get('otp');
    return !!ctrl?.touched && !!ctrl?.invalid;
  }

  sendOtp(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;

    this.isLoading = true;
    this.profileService.sendEmailOtp(this.newEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 2;
        this.toastr.info('OTP sent to ' + this.newEmail);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message);
      },
    });
  }

  verifyAndSave(): void {
    this.otpForm.markAllAsTouched();
    if (this.otpForm.invalid) return;

    this.isLoading = true;
    const otp = this.otpForm.value.otp;
    this.profileService.updateEmail(this.newEmail, otp).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.updateCurrentUserEmail(this.newEmail);
        this.saved.emit(this.newEmail);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message);
      },
    });
  }

  goBack(): void {
    this.step = 1;
    this.otpForm.reset();
  }
}