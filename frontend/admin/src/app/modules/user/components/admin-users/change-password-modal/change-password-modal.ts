import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { Button, ButtonInputConfig, Password, PasswordInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { AdminUserService } from '../../../services';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button, Password],
  templateUrl: './change-password-modal.html',
  styleUrl: './change-password-modal.css',
})
export class ChangePasswordModal implements OnInit {
  @Input() targetAdminId!: number;
  @Input() targetAdminName = '';
  @Input() targetAdminEmail = '';

  @Output() modalClose = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  isSaving = false;

  private readonly destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private adminUserService = inject(AdminUserService);
  private toastr = inject(ToastrService);

  newPasswordConfig: PasswordInputConfig = {
    formControlName: 'password',
    placeholder: 'New Password',
    floating: true,
  };
  confirmPasswordConfig: PasswordInputConfig = {
    formControlName: 'confirmPassword',
    placeholder: 'Confirm New Password',
    floating: true,
  };

  cancelConfig: ButtonInputConfig = {
    variant: 'close',
    text: 'Cancel',
    onClick: () => this.close(),
  };
  saveConfig: ButtonInputConfig = {
    variant: 'save',
    text: 'Save',
    onClick: () => this.handleSave(),
  };

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, AppValidators.password]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch }
    );
  }

  private passwordsMatch(group: FormGroup): { [key: string]: boolean } | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  handleSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving) return;

    this.isSaving = true;
    this.saveConfig = { ...this.saveConfig, isLoading: true };

    this.adminUserService
      .changeAdminUserPassword({
        targetAdminId: this.targetAdminId,
        password: this.f['password'].value,
        confirmPassword: this.f['confirmPassword'].value,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Password updated successfully.');
          this.saved.emit();
          this.close();
        },
        error: (err) => {
          this.toastr.error(
            err?.error?.message || err?.error?.errorMessages?.[0] || 'Failed to update password.'
          );
          this.isSaving = false;
          this.saveConfig = { ...this.saveConfig, isLoading: false };
        },
      });
  }

  close(): void {
    this.modalClose.emit();
  }
}