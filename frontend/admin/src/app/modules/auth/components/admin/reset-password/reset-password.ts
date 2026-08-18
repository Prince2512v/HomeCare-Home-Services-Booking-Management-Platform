import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Password, PasswordInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { AuthService } from '@authservices';
import { ROUTES } from '@constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Password],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {
  resetForm!: FormGroup;
  passwordConfig!: PasswordInputConfig;
  confirmPasswordConfig!: PasswordInputConfig;
  emailFromUrl = '';
  isLoading = false;
  isValidating = true;
  tokenInvalid = false;
  tokenInvalidMessage = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.emailFromUrl = this.route.snapshot.queryParamMap.get('email') || '';

    if (!this.token) {
      this.tokenInvalid = true;
      this.tokenInvalidMessage = 'Invalid or expired reset link.';
      this.isValidating = false;
      return;
    }

    this.authService.validateResetToken(this.token).subscribe({
      next: () => {
        this.isValidating = false;
        this.initializeForm();
        this.setFormInputConfig();
      },
      error: (err) => {
        this.isValidating = false;
        this.tokenInvalid = true;
        this.tokenInvalidMessage =
          err?.error?.message;
      },
    });
  }

  private initializeForm(): void {
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, AppValidators.password]],
        confirmPassword: ['', Validators.required],
      },
      { validators: AppValidators.matchPasswords('password', 'confirmPassword') }
    );
  }

  private setFormInputConfig(): void {
    this.passwordConfig = { formControlName: 'password', placeholder: 'New Password' };
    this.confirmPasswordConfig = {
      formControlName: 'confirmPassword',
      placeholder: 'Confirm New Password',
    };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.toastr.warning('Please enter valid password details');
      return;
    }

    this.isLoading = true;

    this.authService
      .resetPassword({
        token: this.token,
        newPassword: this.resetForm.get('password')?.value,
        confirmPassword: this.resetForm.get('confirmPassword')?.value,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.isSuccess) {
            this.toastr.success(res.message);
            setTimeout(() => this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]), 2000);
          } else {
            this.toastr.error(res.errorMessages?.[0] || res.message || 'Reset failed');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(err?.error?.message || 'Something went wrong');
        },
      });
  }

  onSignIn(): void {
    this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
  }
}