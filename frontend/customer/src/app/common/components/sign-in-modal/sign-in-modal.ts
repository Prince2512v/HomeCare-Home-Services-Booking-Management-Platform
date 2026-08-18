import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppValidators } from '@Validators';
import {
  Email,
  EmailInputConfig,
  Name,
  NameInputConfig,
  CommonModal,
} from '@common';
import { AuthService } from '@auth';

@Component({
  selector: 'app-sign-in-modal',
  imports: [CommonModule, ReactiveFormsModule, Email, Name, CommonModal],
  templateUrl: './sign-in-modal.html',
  styleUrl: './sign-in-modal.css',
})
export class SignInModal implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() otpSent = new EventEmitter<{ email: string; name: string }>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  signInForm!: FormGroup;
  emailConfig!: EmailInputConfig;
  nameConfig!: NameInputConfig;
  isLoading = false;

  ngOnInit(): void {
    this.initForm();
    this.initInputConfigs();
  }

  private initForm(): void {
    this.signInForm = this.fb.group({
      name: ['', [Validators.required, AppValidators.name]],
      email: ['', [Validators.required, AppValidators.email]],
    });
  }

  private initInputConfigs(): void {
    this.emailConfig = { formControlName: 'email', placeholder: 'Email' };
    this.nameConfig = { formControlName: 'name', placeholder: 'Name' };
  }

  onGetOtp(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const { email, name } = this.signInForm.value;
    this.isLoading = true;

    this.authService.sendOtp({ email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('OTP sent to your email!');
        this.otpSent.emit({ email, name });
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message);
      },
    });
  }
}
