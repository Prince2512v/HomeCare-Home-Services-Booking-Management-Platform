import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Email, EmailInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { AuthService } from '@authservices';
import { ROUTES } from '@constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Email],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword implements OnInit {
  forgetForm!: FormGroup;
  emailConfig!: EmailInputConfig;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setFormInputConfig();
  }

  private initializeForm(): void {
    this.forgetForm = this.fb.group({
      email: ['', [Validators.required, AppValidators.email]],
    });
  }

  private setFormInputConfig(): void {
    this.emailConfig = {
      formControlName: 'email',
      placeholder: 'Enter your registered email',
    };
  }

  onSubmit(): void {
    if (this.forgetForm.invalid) {
      this.forgetForm.markAllAsTouched();
      this.toastr.warning('Please enter a valid email');
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.forgetForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.forgetForm.reset();
        } else {
          this.toastr.error(res.errorMessages?.[0] || res.message || 'Request failed');
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