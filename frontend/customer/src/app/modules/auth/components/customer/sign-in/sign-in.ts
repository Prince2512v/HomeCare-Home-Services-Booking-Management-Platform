import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppValidators } from '@Validators';
import { Email, EmailInputConfig, Name, NameInputConfig } from '@common';
import { ROUTES } from '@constants';
import { AuthService } from '@auth';

@Component({
  selector: 'app-customer-sign-in',
  imports: [CommonModule, ReactiveFormsModule, Email, Name],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class CustomerSignIn implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  signInForm!: FormGroup;
  emailConfig!: EmailInputConfig;
  nameConfig!: NameInputConfig;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      name: ['', [Validators.required, AppValidators.name]],
      email: ['', [Validators.required, AppValidators.email]],
    });
    this.emailConfig = { formControlName: 'email', placeholder: 'Email' };
    this.nameConfig = { formControlName: 'name', placeholder: 'Name' };
  }
  goToOnboarding(): void {
    this.router.navigate([ROUTES.SERVICE_PARTNER.ONBOARDING.ONBOARDING_ABSOLUTE]);
  }
  onGetOtp(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const { email, name } = this.signInForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.sendOtp({ email }).subscribe({
      next: () => {
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('name', name);
        this.isLoading = false;
        this.toastr.success('OTP sent to your email!');
        this.router.navigate([ROUTES.CUSTOMER.OTP_VERIFY.OTP_VERIFY_ABSOLUTE]);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message || 'Something went wrong. Please try again.');
      },
    });
  }
}