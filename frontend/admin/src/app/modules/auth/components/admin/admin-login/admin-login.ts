import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Password, Email, EmailInputConfig, PasswordInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { Router } from '@angular/router';
import { AuthService } from '@authservices';
import { ROUTES } from '@constants';
import { SessionService } from '@services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Email, Password],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css'],
})
export class AdminLogin implements OnInit {
  loginForm!: FormGroup;
  emailConfig!: EmailInputConfig;
  passwordConfig!: PasswordInputConfig;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private ts: SessionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([ROUTES.HOME.HOME_ABSOLUTE]);
      return;
    }
    this.initializeForm();
    this.setFormInputConfig();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, AppValidators.email]],
      password: ['', [Validators.required, AppValidators.password]],
    });
  }

  private setFormInputConfig(): void {
    this.emailConfig = { formControlName: 'email', placeholder: 'Email' };
    this.passwordConfig = { formControlName: 'password', placeholder: 'Password' };
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastr.warning('Please fill all required fields');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.ts.markLoggedIn();
          this.ts.setCurrentUser(res.data.id, res.data.isSuperAdmin);
          this.router.navigate([ROUTES.HOME.HOME_ABSOLUTE]);
        } else {
          this.toastr.error(res.errorMessages?.[0] || res.message || 'Login failed');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message || 'Something went wrong');
      },
    });
  }

  forgotPassword(): void {
    this.router.navigate([ROUTES.AUTH.FORGOT_PASSWORD.FORGOT_PASSWORD_ABSOLUTE]);
  }
}